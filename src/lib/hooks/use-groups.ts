"use client";

import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import { useSupabaseQuery } from "./use-supabase-query";
import type { Group } from "@/lib/types/database";

export function useGroups(options?: { dayOfWeek?: number; instructorId?: string }) {
  const { activeStudio } = useStudio();

  const result = useSupabaseQuery<Group[]>(
    async () => {
      if (!activeStudio) return [];

      const supabase = createClient();
      let query = supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name), group_memberships(count)")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .eq("group_memberships.is_active", true)
        .order("day_of_week")
        .order("start_time");

      if (options?.dayOfWeek !== undefined) {
        query = query.eq("day_of_week", options.dayOfWeek);
      }
      if (options?.instructorId) {
        query = query.eq("instructor_id", options.instructorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      const groups = (data ?? []).map((g: Record<string, unknown>) => ({
        ...g,
        member_count: (g.group_memberships as { count: number }[])?.[0]?.count ?? 0,
      })) as Group[];
      return groups;
    },
    [activeStudio?.id, options?.dayOfWeek, options?.instructorId],
    [],
    { enabled: !!activeStudio }
  );

  return { groups: result.data, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useGroup(groupId: string) {
  const result = useSupabaseQuery<Group | null>(
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name)")
        .eq("id", groupId)
        .single();

      if (error) throw error;
      return data as Group | null;
    },
    [groupId],
    null,
    { enabled: !!groupId }
  );

  return { group: result.data, loading: result.loading, error: result.error };
}
