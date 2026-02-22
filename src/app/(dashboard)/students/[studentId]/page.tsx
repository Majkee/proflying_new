"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { LevelBadge } from "@/components/shared/badges";
import { StudentForm } from "@/components/students/student-form";
import type { Student, Group, GroupMembership, Pass, Payment } from "@/lib/types/database";

export default function StudentDetailPage({
  params,
}: {
  params: { studentId: string };
}) {
  const [student, setStudent] = useState<Student | null>(null);
  const [groups, setGroups] = useState<(GroupMembership & { group: Group })[]>([]);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { profile } = useUser();
  const supabase = createClient();
  const isManagerPlus = profile?.role === "super_admin" || profile?.role === "manager";

  useEffect(() => {
    async function loadStudent() {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", params.studentId)
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

        // Load passes
        const { data: passData } = await supabase
          .from("passes")
          .select("*")
          .eq("student_id", data.id)
          .order("valid_until", { ascending: false });

        setPasses(passData ?? []);

        // Load payments (manager+ only)
        if (isManagerPlus) {
          const { data: paymentData } = await supabase
            .from("payments")
            .select("*")
            .eq("student_id", data.id)
            .order("paid_at", { ascending: false });

          setPayments(paymentData ?? []);
        }
      }

      setLoading(false);
    }

    loadStudent();
  }, [params.studentId, isManagerPlus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono kursantki</p>
        <Link href="/students">
          <Button variant="link" className="mt-2">Wróc do listy</Button>
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
        <StudentForm student={student} onSuccess={() => { setEditing(false); window.location.reload(); }} />
      </div>
    );
  }

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
      </div>

      <Tabs defaultValue="groups">
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
          {passes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Brak karnetow</p>
          ) : (
            <div className="grid gap-3 mt-2">
              {passes.map((pass) => {
                const isExpired = new Date(pass.valid_until) < new Date();
                return (
                  <Card key={pass.id} className={isExpired ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={isExpired ? "outline" : "default"}>
                              {pass.pass_type === "monthly_1x" ? "1x/tydzien" :
                               pass.pass_type === "monthly_2x" ? "2x/tydzien" :
                               pass.pass_type === "single_entry" ? "Jednorazowy" : "Indywidualny"}
                            </Badge>
                            {isExpired && <Badge variant="destructive">Wygasl</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pass.valid_from} - {pass.valid_until}
                          </p>
                          {pass.entries_total && (
                            <p className="text-sm text-muted-foreground">
                              Wejscia: {pass.entries_used}/{pass.entries_total}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{pass.price_amount} zl</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
