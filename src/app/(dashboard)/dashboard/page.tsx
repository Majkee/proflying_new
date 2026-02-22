"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Users,
  Layers,
  CreditCard,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import type { Group } from "@/lib/types/database";

export default function DashboardPage() {
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const [todayGroups, setTodayGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeGroups: 0,
    monthRevenue: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      if (!activeStudio) {
        setLoading(false);
        return;
      }

      const today = new Date().getDay();

      // Fetch today's groups
      const { data: groups } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name)")
        .eq("studio_id", activeStudio.id)
        .eq("day_of_week", today)
        .eq("is_active", true)
        .order("start_time");

      setTodayGroups((groups as Group[]) ?? []);

      // Fetch stats
      const [studentsRes, groupsRes] = await Promise.all([
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("studio_id", activeStudio.id)
          .eq("is_active", true),
        supabase
          .from("groups")
          .select("id", { count: "exact", head: true })
          .eq("studio_id", activeStudio.id)
          .eq("is_active", true),
      ]);

      let monthRevenue = 0;
      let overdueCount = 0;

      if (profile?.role === "super_admin" || profile?.role === "manager") {
        const now = new Date();
        const [revenueRes, overdueRes] = await Promise.all([
          supabase.rpc("get_monthly_revenue", {
            p_studio_id: activeStudio.id,
            p_year: now.getFullYear(),
            p_month: now.getMonth() + 1,
          }),
          supabase.rpc("get_overdue_students", {
            p_studio_id: activeStudio.id,
          }),
        ]);

        if (revenueRes.data && revenueRes.data.length > 0) {
          monthRevenue = revenueRes.data[0].total_amount;
        }
        overdueCount = overdueRes.data?.length ?? 0;
      }

      setStats({
        activeStudents: studentsRes.count ?? 0,
        activeGroups: groupsRes.count ?? 0,
        monthRevenue,
        overdueCount,
      });

      setLoading(false);
    }

    loadDashboard();
  }, [activeStudio?.id, profile?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isManagerPlus = profile?.role === "super_admin" || profile?.role === "manager";

  return (
    <div>
      <PageHeader title="Pulpit" description={activeStudio?.name} />

      {/* Payment alert banner */}
      {isManagerPlus && stats.overdueCount > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              {stats.overdueCount} {stats.overdueCount === 1 ? "kursantka" : "kursantek"} bez aktywnego karnetu
            </p>
          </div>
          <Link href="/payments">
            <Button variant="outline" size="sm">
              Sprawdz
            </Button>
          </Link>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktywne kursantki
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktywne grupy
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGroups}</div>
          </CardContent>
        </Card>
        {isManagerPlus && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Przychod (miesiac)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthRevenue} zl</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Zaleglosci
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdueCount}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Today's classes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dzisiejsze zajecia</h2>
        {todayGroups.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Brak zajec dzisiaj"
            description="Na dzisiaj nie ma zaplanowanych zajec"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {group.code}
                        </Badge>
                        <LevelBadge level={group.level} />
                      </div>
                      <h3 className="font-medium">{group.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(group.start_time)} - {formatTime(group.end_time)}
                  </div>
                  {group.instructor && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.instructor.full_name}
                    </p>
                  )}
                  <Link href={`/attendance/${group.id}`}>
                    <Button className="w-full" size="sm">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Sprawdz obecnosc
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
