"use client";

import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function CalendarPageContent() {
  const { activeStudio } = useStudio();
  const { profile } = useUser();

  if (!activeStudio) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader title="Kalendarz" description={activeStudio.name} />
      <DashboardCalendar studioId={activeStudio.id} hideLinks={profile?.role === "instructor"} />
    </div>
  );
}
