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
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import type { Group } from "@/lib/types/database";

export default function AttendancePage() {
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const [groups, setGroups] = useState<(Group & { member_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTodayGroups() {
      if (!activeStudio) {
        setLoading(false);
        return;
      }

      const today = new Date().getDay();

      const query = supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name, profile_id)")
        .eq("studio_id", activeStudio.id)
        .eq("day_of_week", today)
        .eq("is_active", true)
        .order("start_time");

      const { data } = await query;
      const allGroups: Group[] = (data as Group[]) ?? [];

      // If instructor role, filter to their groups only
      let filteredGroups = allGroups;
      if (profile?.role === "instructor") {
        const { data: instructorRecords } = await supabase
          .from("instructors")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("studio_id", activeStudio.id);

        const instructorIds = instructorRecords?.map((i) => i.id) ?? [];
        filteredGroups = allGroups.filter((g) =>
          instructorIds.includes(g.instructor_id)
        );
      }

      // Get member counts
      const groupsWithCounts = await Promise.all(
        filteredGroups.map(async (group) => {
          const { count } = await supabase
            .from("group_memberships")
            .select("id", { count: "exact", head: true })
            .eq("group_id", group.id)
            .eq("is_active", true);

          return { ...group, member_count: count ?? 0 };
        })
      );

      setGroups(groupsWithCounts);
      setLoading(false);
    }

    loadTodayGroups();
  }, [activeStudio?.id, profile?.id, profile?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
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
