"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import { useSupabaseQuery } from "./use-supabase-query";
import type { Student, PassType } from "@/lib/types/database";

export interface StudentWithPassStatus {
  student_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  pass_id: string | null;
  pass_type: PassType | null;
  template_name: string | null;
  valid_from: string | null;
  valid_until: string | null;
  auto_renew: boolean | null;
  price_amount: number | null;
  is_paid: boolean | null;
}

export function useStudents(search?: string) {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<Student[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      let query = supabase
        .from("students")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .order("full_name");

      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    [activeStudio?.id, search],
    [],
    { enabled: !!activeStudio }
  );

  return { students: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useStudentsWithPassStatus(search?: string) {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<StudentWithPassStatus[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_students_with_pass_status", {
        p_studio_id: activeStudio.id,
      });

      if (error) throw error;

      let results = (data as StudentWithPassStatus[]) ?? [];
      if (search) {
        const q = search.toLowerCase();
        results = results.filter((s) => s.full_name.toLowerCase().includes(q));
      }

      return results;
    },
    [activeStudio?.id, search],
    [],
    { enabled: !!activeStudio }
  );

  return { students: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useStudent(studentId: string) {
  const result = useSupabaseQuery<Student | null>(
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error) throw error;
      return data;
    },
    [studentId],
    null,
    { enabled: !!studentId }
  );

  return { student: result.data, loading: result.loading, error: result.error };
}
