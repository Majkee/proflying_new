"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, Users } from "lucide-react";
import { useGroups } from "@/lib/hooks/use-groups";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorCard } from "@/components/shared/error-card";
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import { DAYS_OF_WEEK } from "@/lib/constants/days";

export function SchedulePageContent() {
  const { groups, loading, error, refetch } = useGroups();
  const [activeDay, setActiveDay] = useState(String(new Date().getDay() || 1));

  // Group by day
  const byDay = groups.reduce(
    (acc, g) => {
      const day = g.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(g);
      return acc;
    },
    {} as Record<number, typeof groups>
  );

  if (error) {
    return (
      <div>
        <PageHeader title="Grafik tygodniowy" />
        <ErrorCard message="Nie udalo sie zaladowac grafiku" onRetry={refetch} />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const workDays = DAYS_OF_WEEK.filter((d) => d.value !== 0); // Mon-Sat

  return (
    <div>
      <PageHeader title="Grafik tygodniowy" />

      {groups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Brak grup w grafiku"
          description="Dodaj grupy, zeby zobaczyc grafik"
        />
      ) : (
        <>
          {/* Desktop: grid view */}
          <div className="hidden lg:grid lg:grid-cols-6 gap-4">
            {workDays.map((day) => (
              <div key={day.value}>
                <h3 className="text-sm font-semibold text-center mb-3 pb-2 border-b">
                  {day.label}
                </h3>
                <div className="space-y-2">
                  {(byDay[day.value] ?? []).map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {group.code}
                            </Badge>
                            <LevelBadge level={group.level} />
                          </div>
                          <p className="text-xs font-medium truncate">{group.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(group.start_time)}-{formatTime(group.end_time)}
                          </div>
                          {group.instructor && (
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {group.instructor.full_name}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <Users className="h-3 w-3" />
                            {group.member_count ?? 0}/{group.capacity}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {(!byDay[day.value] || byDay[day.value].length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-4">-</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: tab view */}
          <div className="lg:hidden">
            <Tabs value={activeDay} onValueChange={setActiveDay}>
              <TabsList className="w-full">
                {workDays.map((day) => (
                  <TabsTrigger key={day.value} value={String(day.value)} className="flex-1 text-xs">
                    {day.short}
                  </TabsTrigger>
                ))}
              </TabsList>
              {workDays.map((day) => (
                <TabsContent key={day.value} value={String(day.value)}>
                  <div className="space-y-3 mt-3">
                    {(byDay[day.value] ?? []).map((group) => (
                      <Link key={group.id} href={`/groups/${group.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary">{group.code}</Badge>
                              <LevelBadge level={group.level} />
                            </div>
                            <h4 className="font-medium">{group.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(group.start_time)} - {formatTime(group.end_time)}
                            </div>
                            {group.instructor && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {group.instructor.full_name}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Users className="h-3.5 w-3.5" />
                              {group.member_count ?? 0}/{group.capacity}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {(!byDay[day.value] || byDay[day.value].length === 0) && (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Brak zajec w tym dniu
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
