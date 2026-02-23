"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
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

export function useStudentsWithPassStatus(search?: string) {
  const [students, setStudents] = useState<StudentWithPassStatus[]>([]);
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
    const { data } = await supabase.rpc("get_students_with_pass_status", {
      p_studio_id: activeStudio.id,
    });

    let results = (data as StudentWithPassStatus[]) ?? [];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((s) => s.full_name.toLowerCase().includes(q));
    }

    setStudents(results);
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
