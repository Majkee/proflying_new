"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Studio, Profile } from "@/lib/types/database";

const STUDIO_COOKIE_KEY = "proflying_active_studio";

interface StudioContextType {
  activeStudio: Studio | null;
  studios: Studio[];
  loading: boolean;
  switchStudio: (studioId: string) => void;
  isAllStudios: boolean;
  setAllStudios: () => void;
}

export const StudioContext = createContext<StudioContextType>({
  activeStudio: null,
  studios: [],
  loading: true,
  switchStudio: () => {},
  isAllStudios: false,
  setAllStudios: () => {},
});

export function useStudio() {
  return useContext(StudioContext);
}

export function useStudioProvider(profile: Profile | null) {
  const [activeStudio, setActiveStudio] = useState<Studio | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAllStudios, setIsAllStudios] = useState(false);
  const supabase = createClient();

  useEffect(() => {
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

        // Restore from cookie or default
        const savedStudioId = localStorage.getItem(STUDIO_COOKIE_KEY);
        const savedStudio = studioList.find((s) => s.id === savedStudioId);

        if (savedStudio) {
          setActiveStudio(savedStudio);
        } else if (profile.default_studio_id) {
          const defaultStudio = studioList.find(
            (s) => s.id === profile.default_studio_id
          );
          if (defaultStudio) {
            setActiveStudio(defaultStudio);
            localStorage.setItem(STUDIO_COOKIE_KEY, defaultStudio.id);
          }
        } else if (studioList.length === 1) {
          setActiveStudio(studioList[0]);
          localStorage.setItem(STUDIO_COOKIE_KEY, studioList[0].id);
        }
      } catch {
        // Studio loading failed, continue with empty state
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
        setIsAllStudios(false);
        localStorage.setItem(STUDIO_COOKIE_KEY, studioId);
      }
    },
    [studios]
  );

  const setAllStudios = useCallback(() => {
    setActiveStudio(null);
    setIsAllStudios(true);
    localStorage.removeItem(STUDIO_COOKIE_KEY);
  }, []);

  return {
    activeStudio,
    studios,
    loading,
    switchStudio,
    isAllStudios,
    setAllStudios,
  };
}
