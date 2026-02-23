"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GroupLevel } from "@/lib/types/database";

export function useGroupLevels(activeOnly = true) {
  const [levels, setLevels] = useState<GroupLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("group_levels")
      .select("*")
      .order("sort_order");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data } = await query;
    setLevels(data ?? []);
    setLoading(false);
  }, [activeOnly]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return { levels, loading, refetch: fetchLevels };
}
