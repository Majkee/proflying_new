"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import { useSupabaseQuery } from "./use-supabase-query";
import type { PassTemplate } from "@/lib/types/database";

export function usePassTemplates() {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<PassTemplate[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("pass_templates")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data ?? [];
    },
    [activeStudio?.id],
    [],
    { enabled: !!activeStudio }
  );

  return { templates: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useAllPassTemplates() {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<PassTemplate[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("pass_templates")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .order("sort_order");

      if (error) throw error;
      return data ?? [];
    },
    [activeStudio?.id],
    [],
    { enabled: !!activeStudio }
  );

  return { templates: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}
