import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Group, Student, Payment, Pass } from "@/lib/types/database";

export async function getStudents(studioId: string, search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("*")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("full_name");

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getStudent(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (error) throw error;
  return data as Student;
}

export async function getGroups(
  studioId: string,
  options?: { dayOfWeek?: number; instructorId?: string }
) {
  const supabase = await createClient();

  let query = supabase
    .from("groups")
    .select("*, instructor:instructors(id, full_name), group_memberships(count)")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .eq("group_memberships.is_active", true)
    .order("day_of_week")
    .order("start_time");

  if (options?.dayOfWeek !== undefined) {
    query = query.eq("day_of_week", options.dayOfWeek);
  }
  if (options?.instructorId) {
    query = query.eq("instructor_id", options.instructorId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    member_count: (g.group_memberships as { count: number }[])?.[0]?.count ?? 0,
  })) as Group[];
}

export async function getGroup(groupId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groups")
    .select("*, instructor:instructors(id, full_name)")
    .eq("id", groupId)
    .single();

  if (error) throw error;
  return data as Group;
}

export async function getPayments(studioId: string, options?: { studentId?: string; limit?: number; offset?: number }) {
  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select("*, student:students(id, full_name), pass:passes(id, pass_type, valid_from, valid_until)")
    .eq("studio_id", studioId)
    .order("paid_at", { ascending: false });

  if (options?.studentId) {
    query = query.eq("student_id", options.studentId);
  }

  if (options?.limit) {
    const offset = options.offset ?? 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Payment[]) ?? [];
}

export async function getPaymentsCount(studioId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", studioId);

  if (error) throw error;
  return count ?? 0;
}

export async function getDashboardStats(studioId: string, profileRole: string) {
  const supabase = await createClient();

  const [studentsRes, groupsRes] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("studio_id", studioId)
      .eq("is_active", true),
    supabase
      .from("groups")
      .select("id", { count: "exact", head: true })
      .eq("studio_id", studioId)
      .eq("is_active", true),
  ]);

  let monthRevenue = 0;
  let overdueCount = 0;
  const isManagerPlus = profileRole === "super_admin" || profileRole === "manager";

  if (isManagerPlus) {
    const now = new Date();
    const [revenueRes, overdueRes] = await Promise.all([
      supabase.rpc("get_monthly_revenue", {
        p_studio_id: studioId,
        p_year: now.getFullYear(),
        p_month: now.getMonth() + 1,
      }),
      supabase.rpc("get_overdue_students", {
        p_studio_id: studioId,
      }),
    ]);

    if (revenueRes.data && revenueRes.data.length > 0) {
      monthRevenue = revenueRes.data[0].total_amount;
    }
    overdueCount = overdueRes.data?.length ?? 0;
  }

  return {
    activeStudents: studentsRes.count ?? 0,
    activeGroups: groupsRes.count ?? 0,
    monthRevenue,
    overdueCount,
  };
}

export async function getTodayGroupsWithMemberCounts(studioId: string) {
  const supabase = await createClient();
  const today = new Date().getDay();

  const { data, error } = await supabase
    .from("groups")
    .select("*, instructor:instructors(id, full_name, profile_id), group_memberships(count)")
    .eq("studio_id", studioId)
    .eq("day_of_week", today)
    .eq("is_active", true)
    .eq("group_memberships.is_active", true)
    .order("start_time");

  if (error) throw error;

  return (data ?? []).map((g: Record<string, unknown>) => ({
    ...g,
    member_count: (g.group_memberships as { count: number }[])?.[0]?.count ?? 0,
  })) as (Group & { member_count: number })[];
}
