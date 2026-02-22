"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Attendance, AttendanceStatus } from "@/lib/types/database";

export function useAttendance(sessionId: string | null) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAttendance = useCallback(async () => {
    if (!sessionId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("attendance")
      .select("*, student:students(id, full_name)")
      .eq("session_id", sessionId);

    setRecords((data as Attendance[]) ?? []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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
      setRecords((prev) => {
        const existing = prev.find((r) => r.student_id === studentId);
        if (existing) {
          return prev.map((r) =>
            r.student_id === studentId ? { ...r, status, note: note ?? r.note } : r
          );
        }
        return [
          ...prev,
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
      });

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
        fetchAttendance();
      }
    },
    [sessionId, fetchAttendance]
  );

  return { records, loading, toggleAttendance, refetch: fetchAttendance };
}

export function useEnsureSession(groupId: string, date: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function ensureSession() {
      if (!groupId || !date) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("ensure_session", {
        p_group_id: groupId,
        p_date: date,
      });

      if (!error && data) {
        setSessionId(data);
      }
      setLoading(false);
    }

    ensureSession();
  }, [groupId, date]);

  return { sessionId, loading };
}
