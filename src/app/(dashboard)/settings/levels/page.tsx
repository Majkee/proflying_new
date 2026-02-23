"use client";

import { useState } from "react";
import { ArrowLeft, Plus, GraduationCap, Edit } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useGroupLevels } from "@/lib/hooks/use-group-levels";
import { LEVEL_COLORS } from "@/lib/constants/levels";
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
import type { GroupLevel } from "@/lib/types/database";

export default function LevelsSettingsPage() {
  const { levels, loading, refetch } = useGroupLevels(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<GroupLevel | null>(null);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [color, setColor] = useState(LEVEL_COLORS[0].value);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openCreate = () => {
    setEditingLevel(null);
    setLabel("");
    setValue("");
    setColor(LEVEL_COLORS[0].value);
    setSortOrder(String(levels.length));
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (level: GroupLevel) => {
    setEditingLevel(level);
    setLabel(level.label);
    setValue(level.value);
    setColor(level.color);
    setSortOrder(String(level.sort_order));
    setIsActive(level.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      label: label.trim(),
      value: editingLevel ? editingLevel.value : value.trim().toLowerCase().replace(/\s+/g, "_"),
      color,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive,
    };

    if (editingLevel) {
      await supabase.from("group_levels").update(payload).eq("id", editingLevel.id);
    } else {
      await supabase.from("group_levels").insert(payload);
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
        title="Poziomy grup"
        description="Zarzadzaj poziomami zaawansowania grup"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nowy poziom
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : levels.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Brak poziomow. Dodaj pierwszy poziom grupy.</p>
      ) : (
        <div className="grid gap-3">
          {levels.map((level) => (
            <Card key={level.id} className={!level.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${level.color}`}>
                        {level.label}
                      </span>
                      {!level.is_active && <Badge variant="outline">Nieaktywny</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {level.value} · kolejnosc: {level.sort_order}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(level)}>
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
            <DialogTitle>{editingLevel ? "Edytuj poziom" : "Nowy poziom"}</DialogTitle>
            <DialogDescription>
              {editingLevel ? "Zmien ustawienia poziomu grupy" : "Dodaj nowy poziom zaawansowania"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa *</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="np. Sredniozaawansowany" />
            </div>
            {!editingLevel && (
              <div className="space-y-2">
                <Label>Klucz (slug) *</Label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="np. sredni_zaawansowany" />
                <p className="text-xs text-muted-foreground">Unikalny identyfikator - male litery, bez spacji</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Kolor</Label>
              <div className="grid grid-cols-4 gap-2">
                {LEVEL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`rounded-lg p-2 text-xs font-medium border-2 transition-all ${c.value} ${
                      color === c.value ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kolejnosc wyswietlania</Label>
              <Input type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
            {editingLevel && (
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
            <Button onClick={handleSave} disabled={saving || !label.trim() || (!editingLevel && !value.trim())}>
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
