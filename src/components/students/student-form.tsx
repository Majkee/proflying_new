"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
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
  const { activeStudio } = useStudio();
  const router = useRouter();
  const supabase = createClient();

  const isEdit = !!student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio) return;

    setError("");
    setSaving(true);

    const data = {
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      date_of_birth: dateOfBirth || null,
      notes: notes.trim() || null,
    };

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
      setSaving(false);
      return;
    }

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Imie i nazwisko *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Imie i nazwisko"
            />
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
