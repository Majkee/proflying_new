"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import type { Profile } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(data);
        }
      } catch (err) {
        logger.error("Failed to load user profile", err);
        setUser(null);
        setProfile(null);
        setError(err instanceof Error ? err : new Error("Blad uwierzytelniania"));
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => setProfile(data ?? null));
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  return { user, profile, loading, error, signOut };
}
