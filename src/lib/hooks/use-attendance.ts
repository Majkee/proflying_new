"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "./use-supabase-query";
import type { Attendance, AttendanceStatus } from "@/lib/types/database";

export function useAttendance(sessionId: string | null) {
  const { data: records, loading, error, refetch: fetchAttendance } = useSupabaseQuery<Attendance[]>(
    async () => {
      if (!sessionId) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("attendance")
        .select("*, student:students(id, full_name)")
        .eq("session_id", sessionId);

      if (error) throw error;
      return (data as Attendance[]) ?? [];
    },
    [sessionId],
    [],
    { enabled: !!sessionId }
  );

  const [optimisticRecords, setOptimisticRecords] = useState<Attendance[] | null>(null);

  const toggleAttendance = useCallback(
    async (
      studentId: string,
      status: AttendanceStatus,
      note?: string,
      isSubstitute?: boolean,
      substituteName?: string
    ) => {
      if (!sessionId) return;

      // Optimistic update
      const currentRecords = optimisticRecords ?? records;
      const existing = currentRecords.find((r) => r.student_id === studentId);
      let newRecords: Attendance[];
      if (existing) {
        newRecords = currentRecords.map((r) =>
          r.student_id === studentId ? { ...r, status, note: note ?? r.note } : r
        );
      } else {
        newRecords = [
          ...currentRecords,
          {
            id: crypto.randomUUID(),
            session_id: sessionId,
            student_id: studentId,
            status,
            note: note ?? null,
            is_substitute: isSubstitute ?? false,
            substitute_name: substituteName ?? null,
            marked_by: "",
            marked_at: new Date().toISOString(),
          },
        ];
      }
      setOptimisticRecords(newRecords);

      const supabase = createClient();
      const { error } = await supabase.rpc("toggle_attendance", {
        p_session_id: sessionId,
        p_student_id: studentId,
        p_status: status,
        p_note: note ?? null,
        p_is_substitute: isSubstitute ?? false,
        p_substitute_name: substituteName ?? null,
      });

      if (error) {
        // Revert on error
        setOptimisticRecords(null);
        fetchAttendance();
      } else {
        setOptimisticRecords(null);
      }
    },
    [sessionId, records, optimisticRecords, fetchAttendance]
  );

  return {
    records: optimisticRecords ?? records,
    loading,
    error,
    toggleAttendance,
    refetch: fetchAttendance,
  };
}

export function useEnsureSession(groupId: string, date: string) {
  const result = useSupabaseQuery<string | null>(
    async () => {
      if (!groupId || !date) return null;

      const supabase = createClient();
      const { data, error } = await supabase.rpc("ensure_session", {
        p_group_id: groupId,
        p_date: date,
      });

      if (error) throw error;
      return data ?? null;
    },
    [groupId, date],
    null,
    { enabled: !!groupId && !!date }
  );

  return { sessionId: result.data, loading: result.loading, error: result.error };
}
