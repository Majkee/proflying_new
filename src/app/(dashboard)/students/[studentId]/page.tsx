"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Edit, Phone, Mail, Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { LevelBadge } from "@/components/shared/badges";
import { StudentForm } from "@/components/students/student-form";
import { PassForm } from "@/components/payments/pass-form";
import type { Student, Group, GroupMembership, Pass, Payment } from "@/lib/types/database";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "groups";
  const [student, setStudent] = useState<Student | null>(null);
  const [groups, setGroups] = useState<(GroupMembership & { group: Group })[]>([]);
  const [passes, setPasses] = useState<(Pass & { template?: { name: string } })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paidPassIds, setPaidPassIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [renewingPass, setRenewingPass] = useState<Pass | undefined>(undefined);
  const { profile } = useUser();
  const isManagerPlus = profile?.role === "super_admin" || profile?.role === "manager";

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    setStudent(data);

    if (data) {
      // Load groups
      const { data: membershipData } = await supabase
        .from("group_memberships")
        .select("*, group:groups(*, instructor:instructors(id, full_name))")
        .eq("student_id", data.id)
        .eq("is_active", true);

      setGroups((membershipData as (GroupMembership & { group: Group })[]) ?? []);

      // Load passes with template info
      const { data: passData } = await supabase
        .from("passes")
        .select("*, template:pass_templates(name)")
        .eq("student_id", data.id)
        .order("valid_until", { ascending: false });

      setPasses(passData ?? []);

      // Load payments for payment status badges and manager tab
      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", data.id)
        .order("paid_at", { ascending: false });

      // Build set of pass IDs that have been paid for their current period
      const paidIds = new Set<string>();
      for (const p of passData ?? []) {
        const hasPaid = (paymentData ?? []).some(
          (pay: { pass_id: string; paid_at: string }) =>
            pay.pass_id === p.id && pay.paid_at >= p.valid_from
        );
        if (hasPaid) paidIds.add(p.id);
      }
      setPaidPassIds(paidIds);

      if (isManagerPlus) {
        setPayments((paymentData as Payment[]) ?? []);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, isManagerPlus]);

  const handlePassCreated = () => {
    setShowPassForm(false);
    setRenewingPass(undefined);
    loadData();
  };

  const openNewPass = () => {
    setRenewingPass(undefined);
    setShowPassForm(true);
  };

  const openRenewPass = (pass: Pass) => {
    setRenewingPass(pass);
    setShowPassForm(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono kursantki</p>
        <Link href="/students">
          <Button variant="link" className="mt-2">Wroc do listy</Button>
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </div>
        <StudentForm student={student} onSuccess={() => { setEditing(false); setLoading(true); loadData(); }} />
      </div>
    );
  }

  const latestPass = passes[0];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>

      <PageHeader
        title={student.full_name}
        action={
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edytuj
          </Button>
        }
      />

      {/* Contact info */}
      <div className="flex flex-wrap gap-4 mb-6">
        {student.phone && (
          <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Phone className="h-3.5 w-3.5" />
            {student.phone}
          </a>
        )}
        {student.email && (
          <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Mail className="h-3.5 w-3.5" />
            {student.email}
          </a>
        )}
        {student.date_of_birth && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(student.date_of_birth + "T00:00:00").toLocaleDateString("pl-PL")}
          </span>
        )}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="groups">Grupy</TabsTrigger>
          <TabsTrigger value="passes">Karnet</TabsTrigger>
          {isManagerPlus && <TabsTrigger value="payments">Platnosci</TabsTrigger>}
        </TabsList>

        <TabsContent value="groups">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Brak przypisanych grup</p>
          ) : (
            <div className="grid gap-3 mt-2">
              {groups.map((gm) => (
                <Link key={gm.id} href={`/groups/${gm.group.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{gm.group.code}</Badge>
                          <LevelBadge level={gm.group.level} />
                        </div>
                        <p className="font-medium">{gm.group.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="passes">
          {showPassForm ? (
            <div className="mt-2">
              <PassForm
                studentId={student.id}
                previousPass={renewingPass}
                onSuccess={handlePassCreated}
                onCancel={() => { setShowPassForm(false); setRenewingPass(undefined); }}
              />
            </div>
          ) : (
            <>
              <div className="flex gap-2 mt-2 mb-4">
                <Button size="sm" onClick={openNewPass}>
                  <Plus className="mr-1 h-4 w-4" />
                  Nowy karnet
                </Button>
                {latestPass && (
                  <Button size="sm" variant="outline" onClick={() => openRenewPass(latestPass)}>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Odnow karnet
                  </Button>
                )}
              </div>

              {passes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Brak karnetow</p>
              ) : (
                <div className="grid gap-3">
                  {passes.map((pass) => {
                    const isExpired = new Date(pass.valid_until) < new Date();
                    const templateName = pass.template?.name;
                    const isPaid = paidPassIds.has(pass.id);

                    // Auto-renewal date calculations
                    let renewalDate: string | null = null;
                    let nextFrom: string | null = null;
                    let nextUntil: string | null = null;
                    if (pass.auto_renew && !isExpired) {
                      const vFrom = new Date(pass.valid_from + "T00:00:00");
                      const vUntil = new Date(pass.valid_until + "T00:00:00");
                      const durationMs = vUntil.getTime() - vFrom.getTime();
                      const renewal = new Date(vUntil);
                      renewal.setDate(renewal.getDate() + 1);
                      const nEnd = new Date(renewal.getTime() + durationMs);
                      renewalDate = renewal.toLocaleDateString("pl-PL");
                      nextFrom = renewal.toLocaleDateString("pl-PL");
                      nextUntil = nEnd.toLocaleDateString("pl-PL");
                    }

                    return (
                      <Card key={pass.id} className={isExpired ? "opacity-60" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge variant={isExpired ? "outline" : "default"}>
                                  {templateName ??
                                    (pass.pass_type === "monthly_1x" ? "1x/tydzien" :
                                     pass.pass_type === "monthly_2x" ? "2x/tydzien" :
                                     pass.pass_type === "single_entry" ? "Jednorazowy" : "Indywidualny")}
                                </Badge>
                                {isExpired && <Badge variant="destructive">Wygasl</Badge>}
                                {!isExpired && pass.is_active && <Badge variant="secondary">Aktywny</Badge>}
                                {isPaid
                                  ? <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">Oplacony</Badge>
                                  : <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">Nieoplacony</Badge>
                                }
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {pass.valid_from} - {pass.valid_until}
                              </p>
                              {pass.entries_total && (
                                <p className="text-sm text-muted-foreground">
                                  Wejscia: {pass.entries_used}/{pass.entries_total}
                                </p>
                              )}
                              {pass.auto_renew && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Auto-odnowienie
                                  {renewalDate && (
                                    <> · {renewalDate} ({nextFrom} – {nextUntil})</>
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <p className="font-semibold">{pass.price_amount} zl</p>
                              {isManagerPlus && !isExpired && pass.is_active && !isPaid && (
                                <Link href={`/payments/record?student=${student.id}&pass=${pass.id}`}>
                                  <Button size="sm" variant="outline">Zapisz platnosc</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {isManagerPlus && (
          <TabsContent value="payments">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Brak platnosci</p>
            ) : (
              <div className="grid gap-3 mt-2">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payment.amount} zl</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.paid_at).toLocaleDateString("pl-PL")} -{" "}
                          {payment.method === "cash" ? "Gotowka" : "Przelew"}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground">{payment.notes}</p>
                        )}
                      </div>
                      <Badge variant={payment.method === "cash" ? "secondary" : "outline"}>
                        {payment.method === "cash" ? "Gotowka" : "Przelew"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {student.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Notatki</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{student.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
