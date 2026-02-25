"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Layers,
  CreditCard,
  AlertTriangle,
  Cake,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { logger } from "@/lib/utils/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorCard } from "@/components/shared/error-card";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import type { Group, Student } from "@/lib/types/database";


export function DashboardPageContent() {
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const [unpaidStudents, setUnpaidStudents] = useState<
    {
      studentId: string;
      studentName: string;
      groupCode: string;
      reason: "no_pass" | "expired" | "unpaid_pass";
      validUntil: string | null;
      passId: string | null;
      templateName: string | null;
      priceAmount: number | null;
      validFrom: string | null;
    }[]
  >([]);
  const [birthdayStudents, setBirthdayStudents] = useState<Pick<Student, "id" | "full_name" | "date_of_birth">[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    activeGroups: 0,
    monthRevenue: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!activeStudio) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const today = new Date().getDay();
      const todayStr = new Date().toISOString().split("T")[0];

      // Fetch today's groups
      const { data: groups } = await supabase
        .from("groups")
        .select("id, code, name")
        .eq("studio_id", activeStudio.id)
        .eq("day_of_week", today)
        .eq("is_active", true);

      const todayGroups = (groups ?? []) as Pick<Group, "id" | "code" | "name">[];

      // Fetch members of today's groups and their pass status
      if (todayGroups.length > 0) {
        const groupIds = todayGroups.map((g) => g.id);
        const { data: memberships } = await supabase
          .from("group_memberships")
          .select("group_id, student:students(id, full_name)")
          .in("group_id", groupIds)
          .eq("is_active", true);

        const memberList = (memberships ?? []).map((m: Record<string, unknown>) => {
          const student = m.student as { id: string; full_name: string };
          return { groupId: m.group_id as string, studentId: student.id, studentName: student.full_name };
        });

        if (memberList.length > 0) {
          const studentIds = [...new Set(memberList.map((m) => m.studentId))];
          const { data: passes } = await supabase
            .from("passes")
            .select("id, student_id, valid_from, valid_until, pass_type, price_amount, template:pass_templates(name)")
            .in("student_id", studentIds)
            .eq("is_active", true)
            .order("valid_until", { ascending: false });

          // For each student, find best active pass covering today and latest expiry
          const bestPassMap = new Map<string, {
            id: string; validFrom: string; validUntil: string;
            priceAmount: number; templateName: string | null;
          }>();
          const latestExpiryMap = new Map<string, string>();

          for (const p of passes ?? []) {
            const tmpl = p.template as unknown as { name: string } | null;
            if (!latestExpiryMap.has(p.student_id)) {
              latestExpiryMap.set(p.student_id, p.valid_until);
            }
            if (p.valid_from <= todayStr && p.valid_until >= todayStr && !bestPassMap.has(p.student_id)) {
              bestPassMap.set(p.student_id, {
                id: p.id,
                validFrom: p.valid_from,
                validUntil: p.valid_until,
                priceAmount: p.price_amount,
                templateName: tmpl?.name ?? null,
              });
            }
          }

          // Check which active passes have been paid for the current period
          const activePassIds = [...bestPassMap.values()].map((p) => p.id);
          const paidPassIds = new Set<string>();
          if (activePassIds.length > 0) {
            const { data: payments } = await supabase
              .from("payments")
              .select("pass_id, paid_at")
              .in("pass_id", activePassIds);

            for (const pay of payments ?? []) {
              const pass = [...bestPassMap.entries()].find(([, v]) => v.id === pay.pass_id);
              if (pass && pay.paid_at >= pass[1].validFrom) {
                paidPassIds.add(pay.pass_id);
              }
            }
          }

          // Build group lookup
          const groupMap = new Map(todayGroups.map((g) => [g.id, g]));

          // Classify students
          const unpaid: typeof unpaidStudents = [];
          const seen = new Set<string>();
          for (const m of memberList) {
            if (seen.has(m.studentId)) continue;
            seen.add(m.studentId);

            const group = groupMap.get(m.groupId);
            const bestPass = bestPassMap.get(m.studentId);

            if (!bestPass) {
              // No active pass covering today
              const latestExpiry = latestExpiryMap.get(m.studentId) ?? null;
              unpaid.push({
                studentId: m.studentId,
                studentName: m.studentName,
                groupCode: group?.code ?? "",
                reason: latestExpiry ? "expired" : "no_pass",
                validUntil: latestExpiry,
                passId: null,
                templateName: null,
                priceAmount: null,
                validFrom: null,
              });
            } else if (!paidPassIds.has(bestPass.id)) {
              // Active pass but no payment for current period
              unpaid.push({
                studentId: m.studentId,
                studentName: m.studentName,
                groupCode: group?.code ?? "",
                reason: "unpaid_pass",
                validUntil: bestPass.validUntil,
                passId: bestPass.id,
                templateName: bestPass.templateName,
                priceAmount: bestPass.priceAmount,
                validFrom: bestPass.validFrom,
              });
            }
          }
          setUnpaidStudents(unpaid);
        }
      }

      // Fetch birthday students
      const { data: allStudents } = await supabase
        .from("students")
        .select("id, full_name, date_of_birth")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .not("date_of_birth", "is", null);

      const now = new Date();
      const todayMonth = now.getMonth() + 1;
      const todayDay = now.getDate();
      const todayBirthdays = (allStudents ?? []).filter((s) => {
        if (!s.date_of_birth) return false;
        const parts = s.date_of_birth.split("-");
        return parseInt(parts[1]) === todayMonth && parseInt(parts[2]) === todayDay;
      });
      setBirthdayStudents(todayBirthdays);

      // Fetch stats -- fire in parallel
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
    } catch (err) {
      logger.error("Failed to load dashboard", err);
      setError(err instanceof Error ? err : new Error("Nie udalo sie zaladowac pulpitu"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudio?.id, profile?.role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (error) {
    return (
      <div>
        <PageHeader title="Pulpit" description={activeStudio?.name} />
        <ErrorCard message="Nie udalo sie zaladowac pulpitu" onRetry={loadDashboard} />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
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

      {/* Birthday banner */}
      {birthdayStudents.length > 0 && (
        <div className="mb-6 rounded-lg border border-pink-200 bg-pink-50 p-4 flex items-center gap-3">
          <Cake className="h-5 w-5 text-pink-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-pink-800">
              Dzisiaj urodziny:{" "}
              {birthdayStudents.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && ", "}
                  <Link href={`/students/${s.id}`} className="underline hover:text-pink-900">
                    {s.full_name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
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

      {/* Students to pay today */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Do oplaty dzisiaj</h2>
        {unpaidStudents.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Wszystko oplacone"
            description="Wszystkie kursantki z dzisiejszych zajec maja aktywne karnety"
          />
        ) : (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Banknote className="h-4 w-4 text-red-600" />
                Do oplaty ({unpaidStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {unpaidStudents.map((s) => (
                  <div key={s.studentId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{s.studentName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {s.groupCode}
                        </Badge>
                        {s.reason === "unpaid_pass" ? (
                          <span>
                            {s.templateName ?? "Karnet"}
                            {" · "}
                            {new Date(s.validFrom!).toLocaleDateString("pl-PL")} – {new Date(s.validUntil!).toLocaleDateString("pl-PL")}
                            {" · "}
                            {s.priceAmount} zl
                          </span>
                        ) : (
                          <span>
                            {s.validUntil
                              ? `Wygasl: ${new Date(s.validUntil).toLocaleDateString("pl-PL")}`
                              : "Brak karnetu"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={
                        s.reason === "unpaid_pass"
                          ? `/payments/record?student=${s.studentId}&pass=${s.passId}`
                          : `/students/${s.studentId}?tab=passes`
                      }
                    >
                      <Button size="sm" variant="outline">
                        Oplac
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calendar */}
      {activeStudio && (
        <div className="mt-8">
          <DashboardCalendar studioId={activeStudio.id} />
        </div>
      )}
    </div>
  );
}
