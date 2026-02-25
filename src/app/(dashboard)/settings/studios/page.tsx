"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Building2, Edit } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Studio } from "@/lib/types/database";

export default function StudiosSettingsPage() {
  const { data: studios, loading, refetch: loadStudios } = useSupabaseQuery<Studio[]>(
    async () => {
      const supabase = createClient();
      const { data } = await supabase.from("studios").select("*").order("name");
      return data ?? [];
    },
    [],
    []
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingStudio(null);
    setName("");
    setAddress("");
    setPhone("");
    setDialogOpen(true);
  };

  const openEdit = (studio: Studio) => {
    setEditingStudio(studio);
    setName(studio.name);
    setAddress(studio.address ?? "");
    setPhone(studio.phone ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
    };

    if (editingStudio) {
      await supabase.from("studios").update(payload).eq("id", editingStudio.id);
    } else {
      await supabase.from("studios").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    loadStudios();
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
        title="Studia"
        description="Zarzadzaj lokalizacjami akademii"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nowe studio
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <div className="grid gap-3">
          {studios.map((studio) => (
            <Card key={studio.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{studio.name}</h3>
                    {studio.address && (
                      <p className="text-sm text-muted-foreground">{studio.address}</p>
                    )}
                    {studio.phone && (
                      <p className="text-sm text-muted-foreground">{studio.phone}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(studio)}>
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
            <DialogTitle>{editingStudio ? "Edytuj studio" : "Nowe studio"}</DialogTitle>
            <DialogDescription>
              {editingStudio ? "Zmien dane studia" : "Dodaj nowa lokalizacje"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa studia" />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ulica, miasto" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+48 500 000 000" />
            </div>
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
