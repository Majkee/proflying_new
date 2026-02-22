"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, User, Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import type { Profile, Role, Studio, StudioMember } from "@/lib/types/database";

const roleLabels: Record<string, string> = {
  super_admin: "Administrator",
  manager: "Manager",
  instructor: "Instruktor",
};

const roleIcons: Record<string, typeof Shield> = {
  super_admin: ShieldCheck,
  manager: Shield,
  instructor: User,
};

export default function UsersSettingsPage() {
  const [profiles, setProfiles] = useState<(Profile & { studio_members?: StudioMember[] })[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("instructor");
  const [studioId, setStudioId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function loadData() {
    const [profilesRes, studiosRes] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("studios").select("*").eq("is_active", true).order("name"),
    ]);
    setProfiles(profilesRes.data ?? []);
    setStudios(studiosRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async () => {
    setSaving(true);
    setError("");

    // Create auth user via admin API (this requires service role key,
    // so in production you'd use a server action or edge function)
    // For now, we sign up normally and update the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (authError) {
      setError(authError.message);
      setSaving(false);
      return;
    }

    if (authData.user) {
      // Update profile role
      await supabase
        .from("profiles")
        .update({ role: role as Role, full_name: fullName })
        .eq("id", authData.user.id);

      // Assign to studio
      if (studioId && role !== "super_admin") {
        await supabase.from("studio_members").insert({
          profile_id: authData.user.id,
          studio_id: studioId,
          role: role === "manager" ? "manager" : "instructor",
        });
      }
    }

    setSaving(false);
    setCreateOpen(false);
    setEmail("");
    setPassword("");
    setFullName("");
    setRole("instructor");
    setStudioId("");
    loadData();
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
        title="Uzytkownicy"
        description="Zarzadzaj kontami i uprawnieniami"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nowy uzytkownik
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3">
          {profiles.map((profile) => {
            const RoleIcon = roleIcons[profile.role] ?? User;
            return (
              <Card key={profile.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RoleIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{profile.full_name}</h3>
                      <Badge variant={profile.is_active ? "secondary" : "outline"}>
                        {roleLabels[profile.role]}
                      </Badge>
                      {!profile.is_active && (
                        <Badge variant="destructive">Nieaktywny</Badge>
                      )}
                    </div>
                    {profile.phone && (
                      <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nowy uzytkownik</DialogTitle>
            <DialogDescription>Utworz nowe konto uzytkownika</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Imie i nazwisko *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Imie Nazwisko" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.pl" />
            </div>
            <div className="space-y-2">
              <Label>Haslo *</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 znakow" />
            </div>
            <div className="space-y-2">
              <Label>Rola</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor">Instruktor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super_admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role !== "super_admin" && (
              <div className="space-y-2">
                <Label>Przypisz do studia</Label>
                <Select value={studioId} onValueChange={setStudioId}>
                  <SelectTrigger><SelectValue placeholder="Wybierz studio..." /></SelectTrigger>
                  <SelectContent>
                    {studios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Anuluj</Button>
            <Button onClick={handleCreateUser} disabled={saving || !email || !password || !fullName}>
              {saving ? "Tworzenie..." : "Utworz konto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
