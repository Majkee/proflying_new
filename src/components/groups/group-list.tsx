"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import { getDayLabel } from "@/lib/constants/days";
import type { Group } from "@/lib/types/database";

interface GroupListProps {
  groups: Group[];
  showDay?: boolean;
}

export function GroupList({ groups, showDay = true }: GroupListProps) {
  // Group by day of week
  const byDay = groups.reduce(
    (acc, g) => {
      const day = g.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(g);
      return acc;
    },
    {} as Record<number, Group[]>
  );

  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <div className="space-y-6">
      {dayOrder.map((day) => {
        const dayGroups = byDay[day];
        if (!dayGroups || dayGroups.length === 0) return null;

        return (
          <div key={day}>
            {showDay && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {getDayLabel(day)}
              </h3>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dayGroups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{group.code}</Badge>
                        <LevelBadge level={group.level} />
                      </div>
                      <h4 className="font-medium mb-1">{group.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(group.start_time)} - {formatTime(group.end_time)}
                      </div>
                      {group.instructor && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.instructor.full_name}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Users className="h-3.5 w-3.5" />
                        {group.member_count ?? 0}/{group.capacity}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
