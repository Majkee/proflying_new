"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import { useSupabaseQuery } from "./use-supabase-query";
import type { Payment, Pass } from "@/lib/types/database";

export interface UnpaidPass {
  pass_id: string;
  student_id: string;
  student_name: string;
  pass_type: string;
  template_name: string | null;
  valid_from: string;
  valid_until: string;
  price_amount: number;
  auto_renew: boolean;
}

export function usePayments(studentId?: string, options?: { limit?: number; offset?: number }) {
  const { activeStudio } = useStudio();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const result = useSupabaseQuery<Payment[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      let query = supabase
        .from("payments")
        .select("*, student:students(id, full_name), pass:passes(id, pass_type, valid_from, valid_until)")
        .eq("studio_id", activeStudio.id)
        .order("paid_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Payment[]) ?? [];
    },
    [activeStudio?.id, studentId, limit, offset],
    [],
    { enabled: !!activeStudio }
  );

  return { payments: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function usePaymentsCount(studentId?: string) {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<number>(
    async () => {
      if (!activeStudio) return 0;

      const supabase = createClient();
      let query = supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("studio_id", activeStudio.id);

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
    [activeStudio?.id, studentId],
    0,
    { enabled: !!activeStudio }
  );

  return { count: result.data, loading: result.loading, error: result.error };
}

export function useMonthlyRevenue(year: number, month: number) {
  const { activeStudio } = useStudio();

  const initialRevenue = {
    total_amount: 0,
    cash_amount: 0,
    transfer_amount: 0,
    payment_count: 0,
  };

  const result = useSupabaseQuery(
    async () => {
      if (!activeStudio) return initialRevenue;

      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_monthly_revenue", {
        p_studio_id: activeStudio.id,
        p_year: year,
        p_month: month,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : initialRevenue;
    },
    [activeStudio?.id, year, month],
    initialRevenue,
    { enabled: !!activeStudio }
  );

  return { revenue: result.data, loading: result.loading, error: result.error };
}

export function usePasses(studentId?: string) {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<Pass[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      let query = supabase
        .from("passes")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .order("valid_until", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    [activeStudio?.id, studentId],
    [],
    { enabled: !!activeStudio }
  );

  return { passes: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useOverdueStudents() {
  const { activeStudio } = useStudio();

  type OverdueStudent = {
    student_id: string;
    student_name: string;
    last_pass_end: string | null;
    pass_type: string | null;
  };

  const result = useSupabaseQuery<OverdueStudent[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_overdue_students", {
        p_studio_id: activeStudio.id,
      });

      if (error) throw error;
      return data ?? [];
    },
    [activeStudio?.id],
    [],
    { enabled: !!activeStudio }
  );

  return { overdueStudents: result.data, loading: result.loading, error: result.error };
}

export function useUnpaidPasses() {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<UnpaidPass[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_unpaid_passes", {
        p_studio_id: activeStudio.id,
      });

      if (error) throw error;
      return (data ?? []) as UnpaidPass[];
    },
    [activeStudio?.id],
    [],
    { enabled: !!activeStudio }
  );

  return { unpaidPasses: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}
