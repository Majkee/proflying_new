"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import type { Student } from "@/lib/types/database";

export function useStudents(search?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchStudents = useCallback(async () => {
    if (!activeStudio) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("students")
      .select("*")
      .eq("studio_id", activeStudio.id)
      .eq("is_active", true)
      .order("full_name");

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    const { data } = await query;
    setStudents(data ?? []);
    setLoading(false);
  }, [activeStudio?.id, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, refetch: fetchStudents };
}

export function useStudent(studentId: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStudent() {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      setStudent(data);
      setLoading(false);
    }

    if (studentId) fetchStudent();
  }, [studentId]);

  return { student, loading };
}
