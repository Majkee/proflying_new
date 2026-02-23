"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/lib/constants/days";
import { useGroupLevels } from "@/lib/hooks/use-group-levels";
import type { Group, Instructor } from "@/lib/types/database";

interface GroupFormProps {
  group?: Group;
  onSuccess?: () => void;
}

export function GroupForm({ group, onSuccess }: GroupFormProps) {
  const [code, setCode] = useState(group?.code ?? "");
  const [name, setName] = useState(group?.name ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(String(group?.day_of_week ?? "1"));
  const [startTime, setStartTime] = useState(group?.start_time?.slice(0, 5) ?? "17:00");
  const [endTime, setEndTime] = useState(group?.end_time?.slice(0, 5) ?? "18:00");
  const [level, setLevel] = useState<string>(group?.level ?? "podstawa");
  const [instructorId, setInstructorId] = useState(group?.instructor_id ?? "");
  const [capacity, setCapacity] = useState(String(group?.capacity ?? 10));
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const { levels: groupLevels } = useGroupLevels();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { activeStudio } = useStudio();
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!group;

  useEffect(() => {
    async function loadInstructors() {
      if (!activeStudio) return;
      const { data } = await supabase
        .from("instructors")
        .select("*")
        .eq("studio_id", activeStudio.id)
        .eq("is_active", true)
        .order("full_name");
      setInstructors(data ?? []);
    }
    loadInstructors();
  }, [activeStudio?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio) return;

    setError("");
    setSaving(true);

    const payload = {
      code: code.trim(),
      name: name.trim(),
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      level,
      instructor_id: instructorId,
      capacity: parseInt(capacity),
      studio_id: activeStudio.id,
    };

    let result;
    if (isEdit) {
      result = await supabase.from("groups").update(payload).eq("id", group.id);
    } else {
      result = await supabase.from("groups").insert(payload).select().single();
    }

    if (result.error) {
      setError(result.error.message.includes("unique") ? "Kod grupy juz istnieje w tym studiu" : "Wystapil blad podczas zapisywania");
      setSaving(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/groups");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edytuj grupe" : "Nowa grupa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Kod grupy *</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="np. PO1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nazwa grupy" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Dzien tygodnia</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Godzina rozpoczecia</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Godzina zakonczenia</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Poziom</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {groupLevels.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instruktor</Label>
              <Select value={instructorId} onValueChange={setInstructorId}>
                <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Pojemnosc</Label>
              <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !code.trim() || !name.trim() || !instructorId}>
              {saving ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj grupe"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Anuluj</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
