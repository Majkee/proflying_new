"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import type { Group } from "@/lib/types/database";

export function useGroups(options?: { dayOfWeek?: number; instructorId?: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchGroups = useCallback(async () => {
    if (!activeStudio) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from("groups")
      .select("*, instructor:instructors(id, full_name)")
      .eq("studio_id", activeStudio.id)
      .eq("is_active", true)
      .order("day_of_week")
      .order("start_time");

    if (options?.dayOfWeek !== undefined) {
      query = query.eq("day_of_week", options.dayOfWeek);
    }
    if (options?.instructorId) {
      query = query.eq("instructor_id", options.instructorId);
    }

    const { data } = await query;
    setGroups((data as Group[]) ?? []);
    setLoading(false);
  }, [activeStudio?.id, options?.dayOfWeek, options?.instructorId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, refetch: fetchGroups };
}

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGroup() {
      const { data } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name)")
        .eq("id", groupId)
        .single();

      setGroup(data as Group | null);
      setLoading(false);
    }

    if (groupId) fetchGroup();
  }, [groupId]);

  return { group, loading };
}
