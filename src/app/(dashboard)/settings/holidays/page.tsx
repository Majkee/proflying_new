"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CalendarOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query";
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
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { PublicHoliday } from "@/lib/types/database";

const DAY_NAMES = ["Niedziela", "Poniedzialek", "Wtorek", "Sroda", "Czwartek", "Piatek", "Sobota"];

export default function HolidaysSettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const { data: holidays, loading, refetch: loadHolidays } = useSupabaseQuery<PublicHoliday[]>(
    async () => {
      const supabase = createClient();
      const startDate = `${filterYear}-01-01`;
      const endDate = `${filterYear}-12-31`;
      const { data } = await supabase
        .from("public_holidays")
        .select("*")
        .gte("holiday_date", startDate)
        .lte("holiday_date", endDate)
        .order("holiday_date");
      return data ?? [];
    },
    [filterYear],
    []
  );

  const openCreate = () => {
    setHolidayDate("");
    setHolidayName("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!holidayDate || !holidayName.trim()) return;
    setSaving(true);

    const supabase = createClient();
    await supabase.from("public_holidays").insert({
      holiday_date: holidayDate,
      name: holidayName.trim(),
    });

    setSaving(false);
    setDialogOpen(false);
    loadHolidays();
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("public_holidays").delete().eq("id", id);
    setDeleting(false);
    setDeleteConfirmId(null);
    loadHolidays();
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return DAY_NAMES[d.getDay()];
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toISOString().split("T")[0]);
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
        title="Dni wolne"
        description="Swieta panstwowe i dni zamkniecia studia. Karnety z auto-odnowieniem sa przedluzane o te dni."
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj dzien wolny
          </Button>
        }
      />

      {/* Year filter */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterYear((y) => y - 1)}
        >
          &larr;
        </Button>
        <span className="font-medium tabular-nums">{filterYear}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterYear((y) => y + 1)}
        >
          &rarr;
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner size="sm" />
      ) : holidays.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Brak dni wolnych w {filterYear} roku.</p>
      ) : (
        <div className="grid gap-2">
          {holidays.map((h) => {
            const past = isPast(h.holiday_date);
            const dayName = getDayName(h.holiday_date);
            const isWeekend = dayName === "Sobota" || dayName === "Niedziela";
            return (
              <Card key={h.id} className={past ? "opacity-50" : ""}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarOff className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{h.name}</h3>
                        {isWeekend && <Badge variant="outline" className="text-xs">Weekend</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.holiday_date + "T00:00:00").toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {" · "}
                        {dayName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(h.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Przy auto-odnowieniu karnetu liczone sa tylko dni wolne wypadajace w dni robocze (pon-pt).
        Swieta w weekendy nie wplywaja na dlugosc karnetu.
      </p>

      {/* Add holiday dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj dzien wolny</DialogTitle>
            <DialogDescription>
              Dodaj swieto panstwowe lub dzien zamkniecia studia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nazwa *</Label>
              <Input
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="np. Zamkniecie studia"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleSave} disabled={saving || !holidayDate || !holidayName.trim()}>
              {saving ? "Zapisywanie..." : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Usun dzien wolny?</DialogTitle>
            <DialogDescription>
              Ten dzien nie bedzie juz brany pod uwage przy odnawianiu karnetow.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Anuluj</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleting}
            >
              {deleting ? "Usuwanie..." : "Usun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
