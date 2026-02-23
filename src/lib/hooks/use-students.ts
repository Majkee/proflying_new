"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import { useSupabaseQuery } from "./use-supabase-query";
import type { Student } from "@/lib/types/database";

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
