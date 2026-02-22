export type Role = "super_admin" | "manager" | "instructor";
export type StudioRole = "manager" | "instructor";
export type AttendanceStatus = "present" | "absent" | "excused";
export type PassType = "single_entry" | "monthly_1x" | "monthly_2x" | "custom";
export type PaymentMethod = "cash" | "transfer";
export type Level = "kids" | "teens" | "zero" | "podstawa" | "podstawa_plus" | "sredni" | "exotic" | "priv";

export interface Studio {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone: string | null;
  default_studio_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StudioMember {
  id: string;
  profile_id: string;
  studio_id: string;
  role: StudioRole;
  created_at: string;
}

export interface Instructor {
  id: string;
  profile_id: string | null;
  studio_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  studio_id: string;
  code: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  level: Level;
  instructor_id: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  // Joined fields
  instructor?: Instructor;
  member_count?: number;
}

export interface Student {
  id: string;
  studio_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  joined_at: string;
  created_at: string;
}

export interface GroupMembership {
  id: string;
  student_id: string;
  group_id: string;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
  // Joined fields
  student?: Student;
  group?: Group;
}

export interface ClassSession {
  id: string;
  group_id: string;
  session_date: string;
  instructor_id: string | null;
  is_cancelled: boolean;
  notes: string | null;
  created_at: string;
  // Joined fields
  group?: Group;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  note: string | null;
  is_substitute: boolean;
  substitute_name: string | null;
  marked_by: string;
  marked_at: string;
  // Joined fields
  student?: Student;
}

export interface Pass {
  id: string;
  studio_id: string;
  student_id: string;
  pass_type: PassType;
  price_amount: number;
  valid_from: string;
  valid_until: string;
  entries_total: number | null;
  entries_used: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  studio_id: string;
  student_id: string;
  pass_id: string | null;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  recorded_by: string;
  notes: string | null;
  created_at: string;
  // Joined fields
  student?: Student;
  pass?: Pass;
}

// Database function return types
export interface EnsureSessionResult {
  session_id: string;
}

export interface ToggleAttendanceResult {
  id: string;
  status: AttendanceStatus;
}
