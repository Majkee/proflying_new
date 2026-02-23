"use client";

import { useMemo } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { useStudioProvider, StudioContext } from "@/lib/hooks/use-studio";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading: userLoading } = useUser();
  const studioContext = useStudioProvider(profile);

  const contextValue = useMemo(
    () => studioContext,
    [studioContext]
  );

  if (userLoading || studioContext.loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <StudioContext.Provider value={contextValue}>
      <AppShell>{children}</AppShell>
    </StudioContext.Provider>
  );
}
