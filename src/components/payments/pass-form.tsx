"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { usePassTemplates } from "@/lib/hooks/use-pass-templates";
import { PassSchema } from "@/lib/validations/schemas";
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
  onSuccess: (passId: string) => void;
  onCancel: () => void;
}

export function PassForm({ studentId, previousPass, onSuccess, onCancel }: PassFormProps) {
  const { templates, loading: templatesLoading } = usePassTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [price, setPrice] = useState(String(previousPass?.price_amount ?? ""));
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
    previousPass?.entries_total != null ? String(previousPass.entries_total) : ""
  );
  const [autoRenew, setAutoRenew] = useState(previousPass?.auto_renew ?? false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { activeStudio } = useStudio();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setPrice(String(template.default_price));
      setEntriesTotal(template.entries_total != null ? String(template.entries_total) : "");
      setAutoRenew(template.auto_renew_default);
      // Calculate valid_until from valid_from + duration_days
      const from = new Date(validFrom);
      from.setDate(from.getDate() + template.duration_days - 1);
      setValidUntil(from.toISOString().split("T")[0]);
    }
  };

  const handleValidFromChange = (value: string) => {
    setValidFrom(value);
    // Recalculate valid_until if a template is selected
    const template = templates.find((t) => t.id === selectedTemplateId);
    if (template) {
      const from = new Date(value);
      from.setDate(from.getDate() + template.duration_days - 1);
      setValidUntil(from.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio) return;

    setFieldErrors({});

    const parsed = PassSchema.safeParse({
      template_id: selectedTemplateId,
      price_amount: price,
      valid_from: validFrom,
      valid_until: validUntil,
      entries_total: entriesTotal ? parseInt(entriesTotal) : null,
      auto_renew: autoRenew,
      notes,
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

    // Deactivate previous pass if renewing
    if (previousPass) {
      await supabase.from("passes").update({ is_active: false }).eq("id", previousPass.id);
    }

    const { data, error } = await supabase.from("passes").insert({
      studio_id: activeStudio.id,
      student_id: studentId,
      pass_type: "custom",
      template_id: parsed.data.template_id,
      price_amount: parsed.data.price_amount,
      valid_from: parsed.data.valid_from,
      valid_until: parsed.data.valid_until,
      entries_total: parsed.data.entries_total ?? null,
      auto_renew: parsed.data.auto_renew,
      notes: parsed.data.notes,
    }).select("id").single();

    if (error || !data) {
      toast.error("Nie udalo sie zapisac karnetu");
      setSaving(false);
      return;
    }

    toast.success(previousPass ? "Karnet odnowiony" : "Karnet utworzony");
    onSuccess(data.id);
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
            {templatesLoading ? (
              <div className="h-10 flex items-center text-sm text-muted-foreground">Ladowanie...</div>
            ) : (
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger><SelectValue placeholder="Wybierz typ karnetu..." /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.default_price} zl)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cena (zl)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              {fieldErrors.price_amount && <p className="text-sm text-destructive">{fieldErrors.price_amount}</p>}
            </div>
            <div className="space-y-2">
              <Label>Liczba wejsc</Label>
              <Input
                type="number"
                min="1"
                value={entriesTotal}
                onChange={(e) => setEntriesTotal(e.target.value)}
                placeholder="Puste = bez limitu"
              />
              {fieldErrors.entries_total && <p className="text-sm text-destructive">{fieldErrors.entries_total}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Od</Label>
              <Input type="date" value={validFrom} onChange={(e) => handleValidFromChange(e.target.value)} />
              {fieldErrors.valid_from && <p className="text-sm text-destructive">{fieldErrors.valid_from}</p>}
            </div>
            <div className="space-y-2">
              <Label>Do</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              {fieldErrors.valid_until && <p className="text-sm text-destructive">{fieldErrors.valid_until}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="auto-renew"
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="auto-renew">Automatyczne odnawianie karnetu</Label>
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
