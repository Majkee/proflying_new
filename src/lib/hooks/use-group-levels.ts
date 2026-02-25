"use client";

import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "./use-supabase-query";
import type { GroupLevel } from "@/lib/types/database";

export function useGroupLevels(activeOnly = true) {
  const { data: levels, loading, refetch } = useSupabaseQuery<GroupLevel[]>(
    async () => {
      const supabase = createClient();
      let query = supabase
        .from("group_levels")
        .select("*")
        .order("sort_order");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data } = await query;
      return data ?? [];
    },
    [activeOnly],
    []
  );

  return { levels, loading, refetch };
}
