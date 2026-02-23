"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorCard } from "@/components/shared/error-card";
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import type { Group } from "@/lib/types/database";

export function AttendancePageContent() {
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const [groups, setGroups] = useState<(Group & { member_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodayGroups = async () => {
    if (!activeStudio) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const today = new Date().getDay();

      // Single query with embedded count — fixes N+1
      const { data, error: queryError } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name, profile_id), group_memberships(count)")
        .eq("studio_id", activeStudio.id)
        .eq("day_of_week", today)
        .eq("is_active", true)
        .eq("group_memberships.is_active", true)
        .order("start_time");

      if (queryError) throw queryError;

      let allGroups = (data ?? []).map((g: Record<string, unknown>) => ({
        ...g,
        member_count: (g.group_memberships as { count: number }[])?.[0]?.count ?? 0,
      })) as (Group & { member_count: number })[];

      // If instructor role, filter to their groups only
      if (profile?.role === "instructor") {
        const { data: instructorRecords } = await supabase
          .from("instructors")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("studio_id", activeStudio.id);

        const instructorIds = instructorRecords?.map((i) => i.id) ?? [];
        allGroups = allGroups.filter((g) =>
          instructorIds.includes(g.instructor_id)
        );
      }

      setGroups(allGroups);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Nie udalo sie zaladowac zajec"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudio?.id, profile?.id, profile?.role]);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Obecnosc"
          description="Dzisiejsze zajecia - wybierz grupe do sprawdzenia obecnosci"
        />
        <ErrorCard message={error.message} onRetry={loadTodayGroups} />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Obecnosc"
        description="Dzisiejsze zajecia - wybierz grupe do sprawdzenia obecnosci"
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Brak zajec dzisiaj"
          description="Na dzisiaj nie ma zaplanowanych zajec w tym studiu"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/attendance/${group.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{group.code}</Badge>
                    <LevelBadge level={group.level} />
                  </div>
                  <h3 className="font-semibold mb-1">{group.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(group.start_time)} - {formatTime(group.end_time)}
                  </div>
                  {group.instructor && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.instructor.full_name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {group.member_count} kursantek
                    </div>
                    <Button size="sm">
                      <ClipboardCheck className="mr-1 h-4 w-4" />
                      Sprawdz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
