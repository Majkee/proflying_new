"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "./use-studio";
import type { PassTemplate } from "@/lib/types/database";

export function usePassTemplates() {
  const [templates, setTemplates] = useState<PassTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    if (!activeStudio) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("pass_templates")
      .select("*")
      .eq("studio_id", activeStudio.id)
      .eq("is_active", true)
      .order("sort_order");

    setTemplates(data ?? []);
    setLoading(false);
  }, [activeStudio?.id]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}

export function useAllPassTemplates() {
  const [templates, setTemplates] = useState<PassTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    if (!activeStudio) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("pass_templates")
      .select("*")
      .eq("studio_id", activeStudio.id)
      .order("sort_order");

    setTemplates(data ?? []);
    setLoading(false);
  }, [activeStudio?.id]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}
