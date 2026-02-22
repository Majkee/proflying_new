"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

export function PaymentForm({ preselectedStudentId }: PaymentFormProps) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [selectedPassId, setSelectedPassId] = useState("");
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
      const { data } = await supabase
        .from("passes")
        .select("*")
        .eq("student_id", selectedStudent.id)
        .eq("is_active", true)
        .order("valid_until", { ascending: false });
      setPasses(data ?? []);
    }
    loadPasses();
  }, [selectedStudent?.id]);

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearch("");
    setStudents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio || !selectedStudent || !amount) return;

    setError("");
    setSaving(true);

    const { error: err } = await supabase.from("payments").insert({
      studio_id: activeStudio.id,
      student_id: selectedStudent.id,
      pass_id: selectedPassId || null,
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

          {/* Pass selection */}
          {passes.length > 0 && (
            <div className="space-y-2">
              <Label>Powiaz z karnetem</Label>
              <Select value={selectedPassId} onValueChange={setSelectedPassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcjonalnie..." />
                </SelectTrigger>
                <SelectContent>
                  {passes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.pass_type === "monthly_1x" ? "1x/tyg" : p.pass_type === "monthly_2x" ? "2x/tyg" : p.pass_type} - {p.valid_from} do {p.valid_until}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={saving || !selectedStudent || !amount}>
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
