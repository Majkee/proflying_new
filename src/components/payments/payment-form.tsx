"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSearch } from "@/components/students/student-search";
import type { Student, Pass } from "@/lib/types/database";

interface PaymentFormProps {
  preselectedStudentId?: string;
  preselectedPassId?: string;
}

export function PaymentForm({ preselectedStudentId, preselectedPassId }: PaymentFormProps) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [passes, setPasses] = useState<(Pass & { template?: { id: string; name: string } | null })[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [selectedPassId, setSelectedPassId] = useState(preselectedPassId ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const router = useRouter();
  const supabase = createClient();

  // Load students when searching
  useEffect(() => {
    async function loadStudents() {
      if (!activeStudio || !search) {
        setStudents([]);
        return;
      }
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .ilike("full_name", `%${search}%`)
        .limit(10);
      setStudents(data ?? []);
    }
    if (!preselectedStudentId) loadStudents();
  }, [search, activeStudio?.id]);

  // Load preselected student
  useEffect(() => {
    async function loadStudent() {
      if (!preselectedStudentId) return;
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", preselectedStudentId)
        .single();
      if (data) setSelectedStudent(data);
    }
    loadStudent();
  }, [preselectedStudentId]);

  // Load passes for selected student
  useEffect(() => {
    async function loadPasses() {
      if (!selectedStudent) {
        setPasses([]);
        return;
      }
      setLoadingPasses(true);
      const { data } = await supabase
        .from("passes")
        .select("*, template:pass_templates!template_id(id, name)")
        .eq("student_id", selectedStudent.id)
        .eq("is_active", true)
        .order("valid_until", { ascending: false });
      const passData = (data ?? []) as (Pass & { template?: { id: string; name: string } | null })[];
      setPasses(passData);
      setLoadingPasses(false);

      // Auto-select preselected pass or first available pass
      if (preselectedPassId && passData.some((p) => p.id === preselectedPassId)) {
        setSelectedPassId(preselectedPassId);
        const pass = passData.find((p) => p.id === preselectedPassId);
        if (pass && !amount) setAmount(String(pass.price_amount));
      } else if (passData.length === 1) {
        setSelectedPassId(passData[0].id);
        if (!amount) setAmount(String(passData[0].price_amount));
      }
    }
    loadPasses();
  }, [selectedStudent?.id]);

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearch("");
    setStudents([]);
    setSelectedPassId("");
    setAmount("");
  };

  const handlePassChange = (passId: string) => {
    setSelectedPassId(passId);
    const pass = passes.find((p) => p.id === passId);
    if (pass) setAmount(String(pass.price_amount));
  };

  const PASS_TYPE_LABELS: Record<string, string> = {
    single_entry: "Jednorazowy",
    monthly_1x: "1x/tydzien",
    monthly_2x: "2x/tydzien",
    custom: "Indywidualny",
  };

  const getPassLabel = (p: Pass & { template?: { id: string; name: string } | null }) => {
    const label = p.template?.name ?? PASS_TYPE_LABELS[p.pass_type] ?? p.pass_type;
    return `${label} - ${p.valid_from} do ${p.valid_until} (${p.price_amount} zl)`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio || !selectedStudent || !amount || !selectedPassId) return;

    setError("");
    setSaving(true);

    const { error: err } = await supabase.from("payments").insert({
      studio_id: activeStudio.id,
      student_id: selectedStudent.id,
      pass_id: selectedPassId,
      amount: parseInt(amount),
      method,
      recorded_by: profile?.id,
      notes: notes.trim() || null,
    });

    if (err) {
      setError("Wystapil blad podczas zapisywania");
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => {
      router.push("/payments");
    }, 1500);
  };

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">&#10003;</span>
          </div>
          <h3 className="font-semibold text-lg">Platnosc zapisana</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {amount} zl - {selectedStudent?.full_name}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zapisz platnosc</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student selection */}
          {!selectedStudent ? (
            <div className="space-y-2">
              <Label>Kursantka *</Label>
              <StudentSearch value={search} onChange={setSearch} />
              {students.length > 0 && (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                      onClick={() => selectStudent(s)}
                    >
                      {s.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">{selectedStudent.full_name}</span>
              {!preselectedStudentId && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                  Zmien
                </Button>
              )}
            </div>
          )}

          {/* Pass selection - required */}
          {selectedStudent && (
            <div className="space-y-2">
              <Label>Karnet *</Label>
              {loadingPasses ? (
                <div className="h-10 flex items-center text-sm text-muted-foreground">Ladowanie...</div>
              ) : passes.length > 0 ? (
                <Select value={selectedPassId} onValueChange={handlePassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz karnet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {passes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {getPassLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800">Brak aktywnego karnetu</p>
                  <p className="text-yellow-700 mt-1">
                    Najpierw utworz karnet dla tej kursantki.
                  </p>
                  <Link href={`/students/${selectedStudent.id}?tab=passes`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Przejdz do karnetow
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Kwota (zl) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="np. 160"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Metoda platnosci</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as "cash" | "transfer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Gotowka</SelectItem>
                  <SelectItem value="transfer">Przelew</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatkowe informacje..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !selectedStudent || !amount || !selectedPassId}>
              {saving ? "Zapisywanie..." : "Zapisz platnosc"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
