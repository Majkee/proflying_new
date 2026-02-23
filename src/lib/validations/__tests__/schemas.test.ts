import { describe, it, expect } from "vitest";
import { StudentSchema, GroupSchema, PaymentSchema, PassSchema } from "../schemas";

// ---------------------------------------------------------------------------
// StudentSchema
// ---------------------------------------------------------------------------
describe("StudentSchema", () => {
  const validStudent = {
    full_name: "Anna Kowalska",
    email: "anna@example.com",
    phone: "+48 600 100 200",
    date_of_birth: "1990-05-15",
    notes: "Notatka testowa",
  };

  it("accepts valid student data", () => {
    const result = StudentSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
  });

  it("accepts minimal student (only full_name)", () => {
    const result = StudentSchema.safeParse({ full_name: "Jan Nowak" });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = StudentSchema.safeParse({ ...validStudent, full_name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("full_name");
    }
  });

  it("rejects name longer than 100 characters", () => {
    const result = StudentSchema.safeParse({ ...validStudent, full_name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts valid email", () => {
    const result = StudentSchema.safeParse({ ...validStudent, email: "test@domain.pl" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = StudentSchema.safeParse({ ...validStudent, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("accepts empty email and transforms to null", () => {
    const result = StudentSchema.safeParse({ ...validStudent, email: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeNull();
    }
  });

  it("accepts valid Polish phone number (+48 XXX XXX XXX)", () => {
    const result = StudentSchema.safeParse({ ...validStudent, phone: "+48 600 100 200" });
    expect(result.success).toBe(true);
  });

  it("accepts phone number without +48 prefix", () => {
    const result = StudentSchema.safeParse({ ...validStudent, phone: "600 100 200" });
    expect(result.success).toBe(true);
  });

  it("accepts phone number without spaces", () => {
    const result = StudentSchema.safeParse({ ...validStudent, phone: "+48600100200" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const result = StudentSchema.safeParse({ ...validStudent, phone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("phone");
    }
  });

  it("accepts empty phone and transforms to null", () => {
    const result = StudentSchema.safeParse({ ...validStudent, phone: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
    }
  });

  it("accepts valid date format (YYYY-MM-DD)", () => {
    const result = StudentSchema.safeParse({ ...validStudent, date_of_birth: "2000-01-15" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = StudentSchema.safeParse({ ...validStudent, date_of_birth: "15/01/2000" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("date_of_birth");
    }
  });

  it("accepts empty date_of_birth and transforms to null", () => {
    const result = StudentSchema.safeParse({ ...validStudent, date_of_birth: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date_of_birth).toBeNull();
    }
  });

  it("trims notes and transforms empty to null", () => {
    const result = StudentSchema.safeParse({ ...validStudent, notes: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// GroupSchema
// ---------------------------------------------------------------------------
describe("GroupSchema", () => {
  const validGroup = {
    code: "PO1",
    name: "Podstawa Poniedzialek",
    day_of_week: 1,
    start_time: "17:30",
    end_time: "18:30",
    level: "podstawa",
    instructor_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    capacity: 10,
  };

  it("accepts valid group data", () => {
    const result = GroupSchema.safeParse(validGroup);
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = GroupSchema.safeParse({ ...validGroup, code: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = GroupSchema.safeParse({ ...validGroup, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects end_time before start_time", () => {
    const result = GroupSchema.safeParse({ ...validGroup, start_time: "18:00", end_time: "17:00" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endTimeIssue = result.error.issues.find((i) => i.path.includes("end_time"));
      expect(endTimeIssue).toBeDefined();
    }
  });

  it("rejects end_time equal to start_time", () => {
    const result = GroupSchema.safeParse({ ...validGroup, start_time: "17:00", end_time: "17:00" });
    expect(result.success).toBe(false);
  });

  it("accepts end_time after start_time", () => {
    const result = GroupSchema.safeParse({ ...validGroup, start_time: "17:00", end_time: "17:01" });
    expect(result.success).toBe(true);
  });

  it("rejects capacity of 0", () => {
    const result = GroupSchema.safeParse({ ...validGroup, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects capacity above 100", () => {
    const result = GroupSchema.safeParse({ ...validGroup, capacity: 101 });
    expect(result.success).toBe(false);
  });

  it("accepts capacity of 1", () => {
    const result = GroupSchema.safeParse({ ...validGroup, capacity: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts capacity of 100", () => {
    const result = GroupSchema.safeParse({ ...validGroup, capacity: 100 });
    expect(result.success).toBe(true);
  });

  it("rejects day_of_week outside 0-6 range", () => {
    const result = GroupSchema.safeParse({ ...validGroup, day_of_week: 7 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = GroupSchema.safeParse({ ...validGroup, start_time: "5pm" });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID instructor_id", () => {
    const result = GroupSchema.safeParse({ ...validGroup, instructor_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects missing level", () => {
    const result = GroupSchema.safeParse({ ...validGroup, level: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PaymentSchema
// ---------------------------------------------------------------------------
describe("PaymentSchema", () => {
  const validPayment = {
    student_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    pass_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    amount: 160,
    method: "cash" as const,
    notes: "Platnosc za karnet",
  };

  it("accepts valid payment data", () => {
    const result = PaymentSchema.safeParse(validPayment);
    expect(result.success).toBe(true);
  });

  it("rejects amount less than 1", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects amount greater than 100000", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, amount: 100001 });
    expect(result.success).toBe(false);
  });

  it("accepts amount of 1 (minimum)", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, amount: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts amount of 100000 (maximum)", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, amount: 100000 });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID student_id", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, student_id: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("student_id");
    }
  });

  it("rejects non-UUID pass_id", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, pass_id: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("pass_id");
    }
  });

  it("rejects missing student_id", () => {
    const { student_id, ...noStudent } = validPayment;
    const result = PaymentSchema.safeParse(noStudent);
    expect(result.success).toBe(false);
  });

  it("rejects missing pass_id", () => {
    const { pass_id, ...noPass } = validPayment;
    const result = PaymentSchema.safeParse(noPass);
    expect(result.success).toBe(false);
  });

  it("rejects invalid method", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, method: "credit_card" });
    expect(result.success).toBe(false);
  });

  it("accepts transfer method", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, method: "transfer" });
    expect(result.success).toBe(true);
  });

  it("transforms empty notes to null", () => {
    const result = PaymentSchema.safeParse({ ...validPayment, notes: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// PassSchema
// ---------------------------------------------------------------------------
describe("PassSchema", () => {
  const validPass = {
    template_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    price_amount: 160,
    valid_from: "2026-02-01",
    valid_until: "2026-03-02",
    entries_total: 8,
    auto_renew: true,
    notes: "Testowy karnet",
  };

  it("accepts valid pass data", () => {
    const result = PassSchema.safeParse(validPass);
    expect(result.success).toBe(true);
  });

  it("rejects valid_until before valid_from", () => {
    const result = PassSchema.safeParse({
      ...validPass,
      valid_from: "2026-03-01",
      valid_until: "2026-02-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const untilIssue = result.error.issues.find((i) => i.path.includes("valid_until"));
      expect(untilIssue).toBeDefined();
    }
  });

  it("accepts valid_until equal to valid_from", () => {
    const result = PassSchema.safeParse({
      ...validPass,
      valid_from: "2026-02-01",
      valid_until: "2026-02-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = PassSchema.safeParse({ ...validPass, price_amount: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts price of 0", () => {
    const result = PassSchema.safeParse({ ...validPass, price_amount: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects price above 100000", () => {
    const result = PassSchema.safeParse({ ...validPass, price_amount: 100001 });
    expect(result.success).toBe(false);
  });

  it("accepts price of 100000 (maximum)", () => {
    const result = PassSchema.safeParse({ ...validPass, price_amount: 100000 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format for valid_from", () => {
    const result = PassSchema.safeParse({ ...validPass, valid_from: "01-02-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format for valid_until", () => {
    const result = PassSchema.safeParse({ ...validPass, valid_until: "March 2, 2026" });
    expect(result.success).toBe(false);
  });

  it("transforms empty template_id to null", () => {
    const result = PassSchema.safeParse({ ...validPass, template_id: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.template_id).toBeNull();
    }
  });

  it("defaults auto_renew to false when omitted", () => {
    const { auto_renew, ...noAutoRenew } = validPass;
    const result = PassSchema.safeParse(noAutoRenew);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auto_renew).toBe(false);
    }
  });

  it("accepts null entries_total", () => {
    const result = PassSchema.safeParse({ ...validPass, entries_total: null });
    expect(result.success).toBe(true);
  });

  it("rejects entries_total of 0", () => {
    const result = PassSchema.safeParse({ ...validPass, entries_total: 0 });
    expect(result.success).toBe(false);
  });
});
