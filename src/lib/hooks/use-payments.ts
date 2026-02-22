"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import type { Payment, Pass } from "@/lib/types/database";

export function usePayments(studentId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    if (!activeStudio) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("payments")
      .select("*, student:students(id, full_name), pass:passes(id, pass_type, valid_from, valid_until)")
      .eq("studio_id", activeStudio.id)
      .order("paid_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data } = await query;
    setPayments((data as Payment[]) ?? []);
    setLoading(false);
  }, [activeStudio?.id, studentId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, refetch: fetchPayments };
}

export function useMonthlyRevenue(year: number, month: number) {
  const [revenue, setRevenue] = useState({
    total_amount: 0,
    cash_amount: 0,
    transfer_amount: 0,
    payment_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  useEffect(() => {
    async function fetchRevenue() {
      if (!activeStudio) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.rpc("get_monthly_revenue", {
        p_studio_id: activeStudio.id,
        p_year: year,
        p_month: month,
      });

      if (data && data.length > 0) {
        setRevenue(data[0]);
      }
      setLoading(false);
    }

    fetchRevenue();
  }, [activeStudio?.id, year, month]);

  return { revenue, loading };
}

export function usePasses(studentId?: string) {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchPasses = useCallback(async () => {
    if (!activeStudio) {
      setPasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("passes")
      .select("*")
      .eq("studio_id", activeStudio.id)
      .order("valid_until", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data } = await query;
    setPasses(data ?? []);
    setLoading(false);
  }, [activeStudio?.id, studentId]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  return { passes, loading, refetch: fetchPasses };
}

export function useOverdueStudents() {
  const [overdueStudents, setOverdueStudents] = useState<
    { student_id: string; student_name: string; last_pass_end: string | null; pass_type: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  useEffect(() => {
    async function fetchOverdue() {
      if (!activeStudio) {
        setOverdueStudents([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase.rpc("get_overdue_students", {
        p_studio_id: activeStudio.id,
      });

      setOverdueStudents(data ?? []);
      setLoading(false);
    }

    fetchOverdue();
  }, [activeStudio?.id]);

  return { overdueStudents, loading };
}
