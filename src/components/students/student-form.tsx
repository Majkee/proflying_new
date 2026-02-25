"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { StudentSchema } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/lib/types/database";

interface StudentFormProps {
  student?: Student;
  onSuccess?: () => void;
}

export function StudentForm({ student, onSuccess }: StudentFormProps) {
  const [fullName, setFullName] = useState(student?.full_name ?? "");
  const [email, setEmail] = useState(student?.email ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(student?.date_of_birth ?? "");
  const [notes, setNotes] = useState(student?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { activeStudio } = useStudio();
  const router = useRouter();

  const isEdit = !!student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio) return;

    setError("");
    setFieldErrors({});

    const parsed = StudentSchema.safeParse({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date_of_birth: dateOfBirth,
      notes: notes,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const data = parsed.data;

    let result;
    if (isEdit) {
      result = await supabase
        .from("students")
        .update(data)
        .eq("id", student.id);
    } else {
      result = await supabase
        .from("students")
        .insert({ ...data, studio_id: activeStudio.id })
        .select()
        .single();
    }

    if (result.error) {
      setError("Wystapil blad podczas zapisywania");
      toast.error("Nie udalo sie zapisac kursantki");
      setSaving(false);
      return;
    }

    toast.success(isEdit ? "Kursantka zaktualizowana" : "Kursantka dodana");

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/students");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edytuj kursantke" : "Nowa kursantka"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} data-testid="student-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Imie i nazwisko *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Imie i nazwisko"
            />
            {fieldErrors.full_name && (
              <p className="text-sm text-destructive">{fieldErrors.full_name}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+48 600 000 000"
              />
              {fieldErrors.phone && (
                <p className="text-sm text-destructive">{fieldErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.pl"
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Data urodzenia</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            {fieldErrors.date_of_birth && (
              <p className="text-sm text-destructive">{fieldErrors.date_of_birth}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatkowe informacje..."
              rows={3}
            />
            {fieldErrors.notes && (
              <p className="text-sm text-destructive">{fieldErrors.notes}</p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !fullName.trim()}>
              {saving ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj kursantke"}
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
