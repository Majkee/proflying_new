"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Pass } from "@/lib/types/database";

interface PassFormProps {
  studentId: string;
  previousPass?: Pass;
  onSuccess: () => void;
  onCancel: () => void;
}

const PASS_TYPES = [
  { value: "single_entry", label: "Jednorazowe", defaultPrice: 40, defaultEntries: 1 },
  { value: "monthly_1x", label: "Miesięczny 1x/tyg", defaultPrice: 160, defaultEntries: 4 },
  { value: "monthly_2x", label: "Miesięczny 2x/tyg", defaultPrice: 250, defaultEntries: 8 },
  { value: "custom", label: "Indywidualny", defaultPrice: 0, defaultEntries: null },
];

export function PassForm({ studentId, previousPass, onSuccess, onCancel }: PassFormProps) {
  const prevType = PASS_TYPES.find((t) => t.value === previousPass?.pass_type);
  const [passType, setPassType] = useState<string>(previousPass?.pass_type ?? "monthly_1x");
  const [price, setPrice] = useState(String(previousPass?.price_amount ?? prevType?.defaultPrice ?? 160));
  const [validFrom, setValidFrom] = useState(() => {
    if (previousPass?.valid_until) {
      const d = new Date(previousPass.valid_until);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(validFrom);
    d.setMonth(d.getMonth() + 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  const [entriesTotal, setEntriesTotal] = useState(
    String(previousPass?.entries_total ?? prevType?.defaultEntries ?? 4)
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { activeStudio } = useStudio();
  const supabase = createClient();

  const handleTypeChange = (value: string) => {
    setPassType(value);
    const type = PASS_TYPES.find((t) => t.value === value);
    if (type) {
      setPrice(String(type.defaultPrice));
      if (type.defaultEntries) setEntriesTotal(String(type.defaultEntries));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio) return;

    setSaving(true);

    // Deactivate previous pass if renewing
    if (previousPass) {
      await supabase.from("passes").update({ is_active: false }).eq("id", previousPass.id);
    }

    const { error } = await supabase.from("passes").insert({
      studio_id: activeStudio.id,
      student_id: studentId,
      pass_type: passType,
      price_amount: parseInt(price),
      valid_from: validFrom,
      valid_until: validUntil,
      entries_total: entriesTotal ? parseInt(entriesTotal) : null,
      notes: notes.trim() || null,
    });

    if (!error) onSuccess();
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {previousPass ? "Odnow karnet" : "Nowy karnet"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Typ karnetu</Label>
            <Select value={passType} onValueChange={handleTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PASS_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cena (zl)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Liczba wejsc</Label>
              <Input type="number" min="1" value={entriesTotal} onChange={(e) => setEntriesTotal(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Od</Label>
              <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Do</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notatki</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz karnet"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
