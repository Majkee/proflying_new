"use client";

import { useUser } from "@/lib/hooks/use-user";
import { useStudioProvider, StudioContext } from "@/lib/hooks/use-studio";
import { AppShell } from "@/components/layout/app-shell";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading: userLoading } = useUser();
  const studioContext = useStudioProvider(profile);

  if (userLoading || studioContext.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Ladowanie...</span>
        </div>
      </div>
    );
  }

  return (
    <StudioContext.Provider value={studioContext}>
      <AppShell>{children}</AppShell>
    </StudioContext.Provider>
  );
}
