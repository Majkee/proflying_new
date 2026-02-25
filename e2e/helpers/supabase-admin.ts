import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_EMAIL = "test@proflying.pl";
const TEST_PASSWORD = "TestUser123!";
const TEST_STUDIO_ID = "35f329af-34f3-443f-9fbd-47f187f4e627";

/** Service-role client that bypasses RLS — use for deletes and cleanup */
function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Anon client with user auth — use for inserts (respects RLS like the app) */
function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function signInAdmin() {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error) throw new Error(`Admin sign-in failed: ${error.message}`);
  return supabase;
}

export async function createTestStudent(name?: string) {
  const supabase = await signInAdmin();
  const fullName = name ?? `E2E_Student_${Date.now()}`;
  const { data, error } = await supabase
    .from("students")
    .insert({
      full_name: fullName,
      studio_id: TEST_STUDIO_ID,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create test student: ${error.message}`);
  return data;
}

export async function deleteTestStudent(id: string) {
  const supabase = getServiceClient();
  await supabase.from("attendance").delete().eq("student_id", id);
  await supabase.from("payments").delete().eq("student_id", id);
  await supabase.from("passes").delete().eq("student_id", id);
  await supabase.from("group_memberships").delete().eq("student_id", id);
  await supabase.from("students").delete().eq("id", id);
}

export async function createTestGroup(code?: string, name?: string) {
  const supabase = await signInAdmin();
  const ts = Date.now();
  const groupCode = code ?? `E2E${ts}`;
  const groupName = name ?? `E2E_Group_${ts}`;

  // Get first available instructor
  const { data: instructors } = await supabase
    .from("instructors")
    .select("id")
    .eq("studio_id", TEST_STUDIO_ID)
    .eq("is_active", true)
    .limit(1);

  const instructorId = instructors?.[0]?.id;
  if (!instructorId) throw new Error("No active instructor found for test studio");

  // Get first available level
  const { data: levels } = await supabase
    .from("group_levels")
    .select("value")
    .eq("studio_id", TEST_STUDIO_ID)
    .eq("is_active", true)
    .limit(1);

  const level = levels?.[0]?.value ?? "podstawa";

  const { data, error } = await supabase
    .from("groups")
    .insert({
      code: groupCode,
      name: groupName,
      studio_id: TEST_STUDIO_ID,
      day_of_week: 1,
      start_time: "17:00",
      end_time: "18:00",
      level,
      instructor_id: instructorId,
      capacity: 10,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create test group: ${error.message}`);
  return data;
}

export async function deleteTestGroup(id: string) {
  const supabase = getServiceClient();

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id")
    .eq("group_id", id);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s: { id: string }) => s.id);
    await supabase.from("attendance").delete().in("session_id", sessionIds);
    await supabase.from("class_sessions").delete().eq("group_id", id);
  }

  await supabase.from("group_memberships").delete().eq("group_id", id);
  await supabase.from("groups").delete().eq("id", id);
}

export async function createTestPass(studentId: string) {
  const supabase = await signInAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("passes")
    .insert({
      student_id: studentId,
      studio_id: TEST_STUDIO_ID,
      pass_type: "monthly_2x",
      valid_from: today,
      valid_until: nextMonth,
      price_amount: 160,
      entries_total: 8,
      entries_used: 0,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create test pass: ${error.message}`);
  return data;
}

export async function deleteTestPass(id: string) {
  const supabase = getServiceClient();
  await supabase.from("payments").delete().eq("pass_id", id);
  await supabase.from("passes").delete().eq("id", id);
}

export async function addStudentToGroup(studentId: string, groupId: string) {
  const supabase = await signInAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("group_memberships")
    .insert({
      student_id: studentId,
      group_id: groupId,
      is_active: true,
      joined_at: today,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to add student to group: ${error.message}`);
  return data;
}

export async function cleanupE2EData() {
  const supabase = getServiceClient();

  // Find all E2E test students (active and inactive)
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("studio_id", TEST_STUDIO_ID)
    .like("full_name", "E2E_%");

  if (students && students.length > 0) {
    const studentIds = students.map((s: { id: string }) => s.id);

    await supabase.from("attendance").delete().in("student_id", studentIds);
    await supabase.from("payments").delete().in("student_id", studentIds);
    await supabase.from("passes").delete().in("student_id", studentIds);
    await supabase.from("group_memberships").delete().in("student_id", studentIds);
    await supabase.from("students").delete().in("id", studentIds);

    console.log(`[cleanup] Deleted ${students.length} E2E students`);
  }

  // Find all E2E test groups (match by name since codes vary: E2E, E2A, E2R, E2D)
  const { data: groups } = await supabase
    .from("groups")
    .select("id")
    .eq("studio_id", TEST_STUDIO_ID)
    .like("name", "E2E_%");

  if (groups && groups.length > 0) {
    const groupIds = groups.map((g: { id: string }) => g.id);

    const { data: sessions } = await supabase
      .from("class_sessions")
      .select("id")
      .in("group_id", groupIds);

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s: { id: string }) => s.id);
      await supabase.from("attendance").delete().in("session_id", sessionIds);
      await supabase.from("class_sessions").delete().in("id", sessionIds);
    }

    await supabase.from("group_memberships").delete().in("group_id", groupIds);
    await supabase.from("groups").delete().in("id", groupIds);

    console.log(`[cleanup] Deleted ${groups.length} E2E groups`);
  }
}

export { TEST_STUDIO_ID, TEST_EMAIL };
