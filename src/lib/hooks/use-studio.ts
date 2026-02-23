"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import type { Studio, Profile } from "@/lib/types/database";

const STUDIO_COOKIE_KEY = "proflying_active_studio";

interface StudioContextType {
  activeStudio: Studio | null;
  studios: Studio[];
  loading: boolean;
  switchStudio: (studioId: string) => void;
}

export const StudioContext = createContext<StudioContextType>({
  activeStudio: null,
  studios: [],
  loading: true,
  switchStudio: () => {},
});

export function useStudio() {
  return useContext(StudioContext);
}

export function useStudioProvider(profile: Profile | null) {
  const [activeStudio, setActiveStudio] = useState<Studio | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadStudios() {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("studios").select("*").eq("is_active", true);

        if (profile.role !== "super_admin") {
          const { data: members } = await supabase
            .from("studio_members")
            .select("studio_id")
            .eq("profile_id", profile.id);

          const studioIds = members?.map((m) => m.studio_id) ?? [];
          if (studioIds.length === 0) {
            setStudios([]);
            setLoading(false);
            return;
          }
          query = query.in("id", studioIds);
        }

        const { data } = await query.order("name");
        const studioList = data ?? [];
        setStudios(studioList);

        // Restore from cookie or default to Śrem
        const savedStudioId = localStorage.getItem(STUDIO_COOKIE_KEY);
        const savedStudio = studioList.find((s) => s.id === savedStudioId);

        if (savedStudio) {
          setActiveStudio(savedStudio);
        } else {
          const sremStudio = studioList.find((s) =>
            s.name.toLowerCase().includes("śrem") || s.name.toLowerCase().includes("srem")
          );
          const fallback = sremStudio ?? studioList[0] ?? null;
          if (fallback) {
            setActiveStudio(fallback);
            localStorage.setItem(STUDIO_COOKIE_KEY, fallback.id);
          }
        }
      } catch (err) {
        logger.error("Failed to load studios", err);
        setStudios([]);
      } finally {
        setLoading(false);
      }
    }

    loadStudios();
  }, [profile]);

  const switchStudio = useCallback(
    (studioId: string) => {
      const studio = studios.find((s) => s.id === studioId);
      if (studio) {
        setActiveStudio(studio);
        localStorage.setItem(STUDIO_COOKIE_KEY, studioId);
      }
    },
    [studios]
  );

  return {
    activeStudio,
    studios,
    loading,
    switchStudio,
  };
}
