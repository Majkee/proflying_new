import type {
  Studio,
  Profile,
  Student,
  Group,
  Instructor,
  PassTemplate,
  Pass,
  Payment,
  PublicHoliday,
  Attendance,
} from "@/lib/types/database";

export const testStudio: Studio = {
  id: "studio-1",
  name: "ProFlying Mokotow",
  address: "ul. Pulawska 12, Warszawa",
  phone: "+48 600 100 200",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testStudio2: Studio = {
  id: "studio-2",
  name: "ProFlying Wola",
  address: "ul. Wolska 5, Warszawa",
  phone: "+48 600 300 400",
  is_active: true,
  created_at: "2025-02-01T00:00:00Z",
};

export const testProfile: Profile = {
  id: "user-1",
  full_name: "Anna Kowalska",
  role: "super_admin",
  phone: "+48 600 000 001",
  default_studio_id: "studio-1",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testInstructorProfile: Profile = {
  id: "user-2",
  full_name: "Maria Nowak",
  role: "instructor",
  phone: "+48 600 000 002",
  default_studio_id: "studio-1",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testManagerProfile: Profile = {
  id: "user-3",
  full_name: "Katarzyna Wisniewska",
  role: "manager",
  phone: "+48 600 000 003",
  default_studio_id: "studio-1",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testInstructor: Instructor = {
  id: "instr-1",
  profile_id: "user-2",
  studio_id: "studio-1",
  full_name: "Maria Nowak",
  phone: "+48 600 000 002",
  email: "maria@proflying.pl",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testStudent: Student = {
  id: "student-1",
  studio_id: "studio-1",
  full_name: "Ola Malinowska",
  email: "ola@example.com",
  phone: "+48 500 100 200",
  notes: "Poziom podstawa+",
  is_active: true,
  joined_at: "2025-03-01",
  created_at: "2025-03-01T00:00:00Z",
};

export const testStudent2: Student = {
  id: "student-2",
  studio_id: "studio-1",
  full_name: "Maja Krawczyk",
  email: null,
  phone: "+48 500 300 400",
  notes: null,
  is_active: true,
  joined_at: "2025-04-01",
  created_at: "2025-04-01T00:00:00Z",
};

export const testGroup: Group = {
  id: "group-1",
  studio_id: "studio-1",
  code: "PO1",
  name: "Podstawa Poniedzialek",
  day_of_week: 1,
  start_time: "17:30:00",
  end_time: "18:30:00",
  level: "podstawa",
  instructor_id: "instr-1",
  capacity: 10,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  instructor: testInstructor,
};

export const testPassTemplate: PassTemplate = {
  id: "tmpl-1",
  studio_id: "studio-1",
  name: "Karnet 2x/tydzien",
  duration_days: 30,
  entries_total: 8,
  default_price: 160,
  is_active: true,
  sort_order: 1,
  auto_renew_default: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const testPassTemplate2: PassTemplate = {
  id: "tmpl-2",
  studio_id: "studio-1",
  name: "Karnet 1x/tydzien",
  duration_days: 30,
  entries_total: 4,
  default_price: 100,
  is_active: true,
  sort_order: 2,
  auto_renew_default: false,
  created_at: "2025-01-01T00:00:00Z",
};

export const testPass: Pass = {
  id: "pass-1",
  studio_id: "studio-1",
  student_id: "student-1",
  pass_type: "custom",
  template_id: "tmpl-1",
  price_amount: 160,
  valid_from: "2026-02-01",
  valid_until: "2026-03-02",
  entries_total: 8,
  entries_used: 3,
  is_active: true,
  auto_renew: true,
  notes: null,
  created_at: "2026-02-01T00:00:00Z",
  template: testPassTemplate,
};

export const testPayment: Payment = {
  id: "pay-1",
  studio_id: "studio-1",
  student_id: "student-1",
  pass_id: "pass-1",
  amount: 160,
  method: "cash",
  paid_at: "2026-02-01T10:00:00Z",
  recorded_by: "user-1",
  notes: null,
  created_at: "2026-02-01T10:00:00Z",
  student: testStudent,
  pass: testPass,
};

export const testHoliday: PublicHoliday = {
  id: "hol-1",
  holiday_date: "2026-05-01",
  name: "Swieto Pracy",
  created_at: "2025-01-01T00:00:00Z",
};

export const testAttendancePresent: Attendance = {
  id: "att-1",
  session_id: "session-1",
  student_id: "student-1",
  status: "present",
  note: null,
  is_substitute: false,
  substitute_name: null,
  marked_by: "user-1",
  marked_at: "2026-02-22T17:30:00Z",
  student: testStudent,
};

export const testAttendanceAbsent: Attendance = {
  id: "att-2",
  session_id: "session-1",
  student_id: "student-2",
  status: "absent",
  note: "Choroba",
  is_substitute: false,
  substitute_name: null,
  marked_by: "user-1",
  marked_at: "2026-02-22T17:30:00Z",
  student: testStudent2,
};
