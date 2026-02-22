import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

const SUPABASE_URL = "https://allxdkuwvolaoeppbkrm.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbHhka3V3dm9sYW9lcHBia3JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUwMTkxMiwiZXhwIjoyMDg3MDc3OTEyfQ.PVfvY_Qav-7Z2Y2bKKJAB9tfn-eGuK0pmc8KWrkiBJw";
const STUDIO_ID = "a0000000-0000-0000-0000-000000000002";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DAY_MAP = {
  Poniedzialek: 1,
  Wtorek: 2,
  Sroda: 3,
  Czwartek: 4,
  Piatek: 5,
  Sobota: 6,
};

// Unwrap ExcelJS formula cells to get the computed result
function cellValue(cell) {
  const val = cell.value;
  if (val && typeof val === "object" && "result" in val) return val.result;
  return val;
}

function guessLevel(name) {
  if (!name) return "podstawa";
  const upper = name.toUpperCase().trim();
  if (upper.includes("KIDS")) return "kids";
  if (upper.includes("TEENS")) return "teens";
  if (upper.includes("ZERO")) return "zero";
  if (upper.includes("EXO") || upper.includes("EXOTIC")) return "exotic";
  if (upper.includes("ZAAW")) return "sredni"; // zaawansowany maps to sredni
  if (upper.includes("ŚREDNI") || upper.includes("SREDNI")) return "sredni";
  if (upper.includes("PODSTAWA+") || upper.includes("PODSTAWA +"))
    return "podstawa_plus";
  if (upper.includes("PODSTAWA")) return "podstawa";
  // AERIAL, HOOP, SILKS, SZARFA - specialty classes, map to podstawa
  return "podstawa";
}

function formatTime(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  // ExcelJS returns dates for time cells
  if (val instanceof Date) {
    const h = val.getHours().toString().padStart(2, "0");
    const m = val.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
  // Could be {hour, minute} object
  if (val.hour !== undefined) {
    return `${String(val.hour).padStart(2, "0")}:${String(val.minute).padStart(2, "0")}`;
  }
  return null;
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  return null;
}

function normalizeName(name) {
  if (!name) return null;
  return name.trim().replace(/\s+/g, " ");
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("/Users/maciej/proflying_new/gostyn.xlsm");

  // =========================================================
  // 1. Parse Kursantki (Students) - build name->data lookup
  // =========================================================
  const kursantkiSheet = wb.getWorksheet("Kursantki");
  const kursantkiMap = new Map(); // excelId -> {name, email, phone, notes, groups, joinDate, passExpiry}
  const nameToExcelId = new Map(); // normalized name -> excelId

  kursantkiSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // header
    const excelId = cellValue(row.getCell(1));
    const name = normalizeName(String(cellValue(row.getCell(2)) || ""));
    if (!excelId || !name) return;

    const email = cellValue(row.getCell(3)) || null;
    let phone = cellValue(row.getCell(4)) || null;
    if (phone) phone = String(phone);
    const notes = cellValue(row.getCell(5)) || null;
    const groups = cellValue(row.getCell(6)) || null;
    const passExpiry = cellValue(row.getCell(8)) || null;

    kursantkiMap.set(excelId, { name, email, phone, notes, groups, passExpiry });
    nameToExcelId.set(name.toUpperCase(), excelId);
  });

  console.log(`Kursantki loaded: ${kursantkiMap.size} students`);

  // =========================================================
  // 2. Parse Platnosc (Payments) - build excelId -> payment info
  // =========================================================
  const platnoscSheet = wb.getWorksheet("Platnosc");
  const paymentMap = new Map(); // excelId -> {name, lastPaid, nextPay, status, amount}

  platnoscSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const excelId = cellValue(row.getCell(1));
    const name = normalizeName(String(cellValue(row.getCell(2)) || ""));
    if (!excelId || !name) return;
    if (paymentMap.has(excelId)) return; // skip duplicates, keep first

    const lastPaid = cellValue(row.getCell(4)) || null;
    const nextPay = cellValue(row.getCell(5)) || null;
    const status = cellValue(row.getCell(6)) || null;
    const amount = cellValue(row.getCell(7)) || null;

    // nextPay can be a Date or ISO string from formula
    let nextPayDate = null;
    if (nextPay instanceof Date) nextPayDate = nextPay;
    else if (typeof nextPay === "string" && nextPay.match(/^\d{4}-/)) nextPayDate = new Date(nextPay);

    let lastPaidDate = null;
    if (lastPaid instanceof Date) lastPaidDate = lastPaid;
    else if (typeof lastPaid === "string" && lastPaid.match(/^\d{4}-/)) lastPaidDate = new Date(lastPaid);

    paymentMap.set(excelId, {
      name,
      lastPaid: lastPaidDate,
      nextPay: nextPayDate,
      status: typeof status === "string" ? status : null,
      amount: typeof amount === "number" ? amount : null,
    });
  });

  console.log(`Platnosc loaded: ${paymentMap.size} entries`);

  // =========================================================
  // 3. Parse Grupy (Groups) - build groups and instructors
  // =========================================================
  const grupySheet = wb.getWorksheet("Grupy");
  const groups = [];
  const instructorNames = new Set();

  grupySheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const code = cellValue(row.getCell(2));
    const fullName = cellValue(row.getCell(3));
    if (!code || !fullName) return; // skip empty groups
    if (String(fullName).trim().toLowerCase() === "x") return; // skip placeholder groups

    const day = String(cellValue(row.getCell(4)) || "");
    const startTime = cellValue(row.getCell(5));
    const endTime = cellValue(row.getCell(6));
    const instructor = cellValue(row.getCell(7));
    const capacity = cellValue(row.getCell(8)) || 9;

    if (!startTime || !endTime) return; // skip groups without times

    const dayOfWeek = DAY_MAP[day];
    if (dayOfWeek === undefined) return;

    if (instructor) instructorNames.add(normalizeName(String(instructor)));

    groups.push({
      code: String(code).trim(),
      name: normalizeName(String(fullName)),
      dayOfWeek,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      instructor: instructor ? normalizeName(String(instructor)) : null,
      capacity: typeof capacity === "number" ? capacity : 9,
      level: guessLevel(fullName),
    });
  });

  console.log(`Groups loaded: ${groups.length}`);
  console.log(`Unique instructors: ${[...instructorNames].join(", ")}`);

  // =========================================================
  // 4. Parse day sheets for memberships (student <-> group)
  // =========================================================
  const memberships = []; // {studentName, groupCode}
  const activeStudentNames = new Set();

  for (const [dayName] of Object.entries(DAY_MAP)) {
    const sheet = wb.getWorksheet(dayName);
    if (!sheet) continue;

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const groupCode = cellValue(row.getCell(1));
      const studentName = cellValue(row.getCell(5));
      if (!groupCode || !studentName || typeof studentName !== "string") return;
      const normalized = normalizeName(studentName);
      if (!normalized) return;

      // Check this group actually exists in our active groups list
      const groupExists = groups.some(
        (g) => g.code === String(groupCode).trim()
      );
      if (!groupExists) return;

      memberships.push({
        studentName: normalized,
        groupCode: String(groupCode).trim(),
      });
      activeStudentNames.add(normalized.toUpperCase());
    });
  }

  // Deduplicate memberships
  const membershipSet = new Set(
    memberships.map((m) => `${m.studentName.toUpperCase()}|${m.groupCode}`)
  );
  const uniqueMemberships = [...membershipSet].map((key) => {
    const [name, code] = key.split("|");
    const original = memberships.find(
      (m) =>
        m.studentName.toUpperCase() === name && m.groupCode === code
    );
    return original;
  });

  console.log(
    `Active students: ${activeStudentNames.size}, Memberships: ${uniqueMemberships.length}`
  );

  // =========================================================
  // 5. INSERT INSTRUCTORS
  // =========================================================
  console.log("\n--- Inserting instructors ---");
  const instructorDbMap = new Map(); // name -> uuid

  for (const name of instructorNames) {
    const { data, error } = await supabase
      .from("instructors")
      .insert({
        studio_id: STUDIO_ID,
        full_name: name,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  ERROR inserting instructor ${name}:`, error.message);
      continue;
    }
    instructorDbMap.set(name, data.id);
    console.log(`  Inserted: ${name} -> ${data.id}`);
  }

  // =========================================================
  // 6. INSERT GROUPS
  // =========================================================
  console.log("\n--- Inserting groups ---");
  const groupDbMap = new Map(); // code -> uuid

  for (const g of groups) {
    const instructorId = g.instructor
      ? instructorDbMap.get(g.instructor)
      : null;
    if (g.instructor && !instructorId) {
      console.error(`  WARNING: no instructor ID for ${g.instructor}`);
      continue;
    }

    const { data, error } = await supabase
      .from("groups")
      .insert({
        studio_id: STUDIO_ID,
        code: g.code,
        name: g.name,
        day_of_week: g.dayOfWeek,
        start_time: g.startTime,
        end_time: g.endTime,
        level: g.level,
        instructor_id: instructorId,
        capacity: g.capacity,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  ERROR inserting group ${g.code}:`, error.message);
      continue;
    }
    groupDbMap.set(g.code, data.id);
    console.log(`  Inserted: ${g.code} (${g.name}) -> ${data.id}`);
  }

  // =========================================================
  // 7. INSERT STUDENTS (only active ones from day sheets)
  // =========================================================
  console.log("\n--- Inserting students ---");
  const studentDbMap = new Map(); // UPPERCASE name -> uuid

  // Build the student data from Kursantki + day sheets
  for (const upperName of activeStudentNames) {
    const excelId = nameToExcelId.get(upperName);
    const kData = excelId ? kursantkiMap.get(excelId) : null;

    const insertData = {
      studio_id: STUDIO_ID,
      full_name: kData ? kData.name : upperName,
      email: kData?.email || null,
      phone: kData?.phone || null,
      notes: kData?.notes || null,
    };

    const { data, error } = await supabase
      .from("students")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      console.error(
        `  ERROR inserting student ${insertData.full_name}:`,
        error.message
      );
      continue;
    }
    studentDbMap.set(upperName, data.id);
  }
  console.log(`  Inserted ${studentDbMap.size} students`);

  // =========================================================
  // 8. INSERT GROUP MEMBERSHIPS
  // =========================================================
  console.log("\n--- Inserting memberships ---");
  let membershipCount = 0;

  for (const m of uniqueMemberships) {
    const studentId = studentDbMap.get(m.studentName.toUpperCase());
    const groupId = groupDbMap.get(m.groupCode);

    if (!studentId || !groupId) continue;

    const { error } = await supabase.from("group_memberships").insert({
      student_id: studentId,
      group_id: groupId,
    });

    if (error) {
      console.error(
        `  ERROR: ${m.studentName} -> ${m.groupCode}: ${error.message}`
      );
    } else {
      membershipCount++;
    }
  }
  console.log(`  Inserted ${membershipCount} memberships`);

  // =========================================================
  // 9. INSERT PASSES for students with "Oplacony" status
  // =========================================================
  console.log("\n--- Inserting passes ---");
  let passCount = 0;

  for (const [excelId, pData] of paymentMap) {
    if (pData.status !== "Opłacony") continue;
    if (!pData.nextPay) continue;

    const upperName = pData.name.toUpperCase();
    const studentId = studentDbMap.get(upperName);
    if (!studentId) continue; // student not in active list

    // Calculate valid_from: ~1 month before nextPay
    const validUntil = new Date(pData.nextPay);
    const validFrom = new Date(validUntil);
    validFrom.setMonth(validFrom.getMonth() - 1);

    const { error } = await supabase.from("passes").insert({
      studio_id: STUDIO_ID,
      student_id: studentId,
      pass_type: "monthly_1x",
      price_amount: pData.amount || 0,
      valid_from: validFrom.toISOString().split("T")[0],
      valid_until: validUntil.toISOString().split("T")[0],
      is_active: true,
    });

    if (error) {
      console.error(`  ERROR pass for ${pData.name}: ${error.message}`);
    } else {
      passCount++;
    }
  }
  console.log(`  Inserted ${passCount} active passes`);

  // =========================================================
  // SUMMARY
  // =========================================================
  console.log("\n=== IMPORT SUMMARY ===");
  console.log(`Instructors: ${instructorDbMap.size}`);
  console.log(`Groups: ${groupDbMap.size}`);
  console.log(`Students: ${studentDbMap.size}`);
  console.log(`Memberships: ${membershipCount}`);
  console.log(`Passes: ${passCount}`);
}

main().catch(console.error);
