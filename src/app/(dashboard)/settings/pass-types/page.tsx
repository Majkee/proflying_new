"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Ticket, Edit } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useAllPassTemplates } from "@/lib/hooks/use-pass-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import type { PassTemplate } from "@/lib/types/database";

export default function PassTypesSettingsPage() {
  const { templates, loading, refetch } = useAllPassTemplates();
  const { activeStudio } = useStudio();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PassTemplate | null>(null);
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [entriesTotal, setEntriesTotal] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [autoRenewDefault, setAutoRenewDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openCreate = () => {
    setEditingTemplate(null);
    setName("");
    setDurationDays("30");
    setEntriesTotal("");
    setDefaultPrice("0");
    setIsActive(true);
    setAutoRenewDefault(true);
    setSortOrder(String(templates.length));
    setDialogOpen(true);
  };

  const openEdit = (template: PassTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setDurationDays(String(template.duration_days));
    setEntriesTotal(template.entries_total != null ? String(template.entries_total) : "");
    setDefaultPrice(String(template.default_price));
    setIsActive(template.is_active);
    setAutoRenewDefault(template.auto_renew_default);
    setSortOrder(String(template.sort_order));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!activeStudio) return;
    setSaving(true);

    const payload = {
      studio_id: activeStudio.id,
      name: name.trim(),
      duration_days: parseInt(durationDays) || 30,
      entries_total: entriesTotal ? parseInt(entriesTotal) : null,
      default_price: parseInt(defaultPrice) || 0,
      is_active: isActive,
      auto_renew_default: autoRenewDefault,
      sort_order: parseInt(sortOrder) || 0,
    };

    if (editingTemplate) {
      await supabase.from("pass_templates").update(payload).eq("id", editingTemplate.id);
    } else {
      await supabase.from("pass_templates").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Ustawienia
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Typy karnetow"
        description="Zarzadzaj szablonami karnetow dla studia"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nowy typ karnetu
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Brak szablonow karnetow. Dodaj pierwszy typ karnetu.</p>
      ) : (
        <div className="grid gap-3">
          {templates.map((template) => (
            <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{template.name}</h3>
                      {!template.is_active && <Badge variant="outline">Nieaktywny</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.default_price} zl
                      {" · "}
                      {template.duration_days} dni
                      {template.entries_total != null && ` · ${template.entries_total} wejsc`}
                      {template.auto_renew_default && " · auto-odnowienie"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edytuj typ karnetu" : "Nowy typ karnetu"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Zmien ustawienia szablonu karnetu" : "Dodaj nowy szablon karnetu"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Miesięczny 1x/tyg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cena domyslna (zl)</Label>
                <Input type="number" min="0" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Czas trwania (dni)</Label>
                <Input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Liczba wejsc</Label>
                <Input
                  type="number"
                  min="1"
                  value={entriesTotal}
                  onChange={(e) => setEntriesTotal(e.target.value)}
                  placeholder="Puste = bez limitu"
                />
              </div>
              <div className="space-y-2">
                <Label>Kolejnosc wyswietlania</Label>
                <Input type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="auto-renew-default"
                type="checkbox"
                checked={autoRenewDefault}
                onChange={(e) => setAutoRenewDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="auto-renew-default">Automatyczne odnawianie (domyslnie)</Label>
            </div>
            {editingTemplate && (
              <div className="flex items-center gap-2">
                <input
                  id="is-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is-active">Aktywny</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
