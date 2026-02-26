"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Plus, User, Shield, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createUserAction, deleteUserAction } from "./actions";
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import type { Profile, Role, Studio, StudioMember, Instructor } from "@/lib/types/database";

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
  const { data: queryData, loading, refetch: loadData } = useSupabaseQuery(
    async () => {
      const supabase = createClient();
      const [profilesRes, studiosRes, instructorsRes, membersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("studios").select("*").eq("is_active", true).order("name"),
        supabase.from("instructors").select("*").eq("is_active", true).order("full_name"),
        supabase.from("studio_members").select("*"),
      ]);
      return {
        profiles: (profilesRes.data ?? []) as Profile[],
        studios: (studiosRes.data ?? []) as Studio[],
        instructors: (instructorsRes.data ?? []) as Instructor[],
        members: (membersRes.data ?? []) as StudioMember[],
      };
    },
    [],
    { profiles: [] as Profile[], studios: [] as Studio[], instructors: [] as Instructor[], members: [] as StudioMember[] }
  );
  const { profiles, studios, instructors, members } = queryData;

  // Derived data
  const studioMap = useMemo(
    () => new Map(studios.map((s) => [s.id, s])),
    [studios]
  );

  const membersByProfile = useMemo(() => {
    const map = new Map<string, StudioMember[]>();
    for (const m of members) {
      const list = map.get(m.profile_id) ?? [];
      list.push(m);
      map.set(m.profile_id, list);
    }
    return map;
  }, [members]);

  const instructorByProfile = useMemo(() => {
    const map = new Map<string, Instructor>();
    for (const i of instructors) {
      if (i.profile_id) map.set(i.profile_id, i);
    }
    return map;
  }, [instructors]);

  const unlinkedInstructors = useMemo(
    () => instructors.filter((i) => i.profile_id === null),
    [instructors]
  );

  // Create user dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("instructor");
  const [studioId, setStudioId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Link instructor dialog state
  const [linkInstructor, setLinkInstructor] = useState<Instructor | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Delete confirmation dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleCreateUser = async () => {
    setSaving(true);
    setError("");

    const result = await createUserAction({
      email,
      password,
      fullName,
      role,
      studioId,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
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

  const handleLinkInstructor = async () => {
    if (!linkInstructor) return;
    setLinkSaving(true);
    setLinkError("");

    const result = await createUserAction({
      email: linkEmail,
      password: linkPassword,
      fullName: linkInstructor.full_name,
      role: "instructor",
      studioId: linkInstructor.studio_id,
      instructorId: linkInstructor.id,
    });

    if (result.error) {
      setLinkError(result.error);
      setLinkSaving(false);
      return;
    }

    setLinkSaving(false);
    setLinkInstructor(null);
    setLinkEmail("");
    setLinkPassword("");
    loadData();
  };

  const handleDelete = async (profileId: string) => {
    setDeleting(true);

    const result = await deleteUserAction(profileId);

    if (result.error) {
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDeleteConfirmId(null);
    setDeleteConfirmName("");
    loadData();
  };

  const openLinkDialog = (instructor: Instructor) => {
    setLinkInstructor(instructor);
    setLinkEmail(instructor.email ?? "");
    setLinkPassword("");
    setLinkError("");
  };

  const getProfileDetails = (profile: Profile) => {
    const parts: string[] = [];

    // Studio names
    const profileMembers = membersByProfile.get(profile.id) ?? [];
    const studioNames = profileMembers
      .map((m) => studioMap.get(m.studio_id)?.name)
      .filter(Boolean);
    if (studioNames.length > 0) parts.push(studioNames.join(", "));

    // Email from linked instructor
    const linkedInstructor = instructorByProfile.get(profile.id);
    if (linkedInstructor?.email) parts.push(linkedInstructor.email);

    // Phone
    if (profile.phone) parts.push(profile.phone);

    return parts.join(" · ");
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
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {/* Users with accounts */}
          <div className="grid gap-3">
            {profiles.map((profile) => {
              const RoleIcon = roleIcons[profile.role] ?? User;
              const details = getProfileDetails(profile);
              return (
                <Card key={profile.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{profile.full_name}</h3>
                        <Badge variant={profile.is_active ? "secondary" : "outline"}>
                          {roleLabels[profile.role]}
                        </Badge>
                        {!profile.is_active && (
                          <Badge variant="destructive">Nieaktywny</Badge>
                        )}
                      </div>
                      {details && (
                        <p className="text-sm text-muted-foreground truncate">{details}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setDeleteConfirmId(profile.id);
                        setDeleteConfirmName(profile.full_name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Unlinked instructors */}
          {unlinkedInstructors.length > 0 && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <h2 className="text-lg font-semibold mb-1">Instruktorzy bez konta</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ci instruktorzy sa przypisani do grup, ale nie maja jeszcze konta w systemie.
              </p>
              <div className="grid gap-3">
                {unlinkedInstructors.map((instructor) => {
                  const studio = studioMap.get(instructor.studio_id);
                  const parts: string[] = [];
                  if (studio) parts.push(studio.name);
                  if (instructor.email) parts.push(instructor.email);
                  if (instructor.phone) parts.push(instructor.phone);
                  return (
                    <Card key={instructor.id} className="border-dashed">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{instructor.full_name}</h3>
                          {parts.length > 0 && (
                            <p className="text-sm text-muted-foreground truncate">
                              {parts.join(" · ")}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1"
                          onClick={() => openLinkDialog(instructor)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Utworz konto
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create new user dialog */}
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

      {/* Link instructor dialog */}
      <Dialog open={linkInstructor !== null} onOpenChange={(open) => !open && setLinkInstructor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Utworz konto dla instruktora</DialogTitle>
            <DialogDescription>Powiaz istniejacego instruktora z kontem w systemie</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Imie i nazwisko</Label>
              <Input value={linkInstructor?.full_name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Studio</Label>
              <Input value={studioMap.get(linkInstructor?.studio_id ?? "")?.name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="email@example.pl" />
            </div>
            <div className="space-y-2">
              <Label>Haslo *</Label>
              <Input type="password" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} placeholder="Min. 6 znakow" />
            </div>
            {linkError && <p className="text-sm text-destructive">{linkError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkInstructor(null)}>Anuluj</Button>
            <Button onClick={handleLinkInstructor} disabled={linkSaving || !linkEmail || !linkPassword}>
              {linkSaving ? "Tworzenie..." : "Utworz konto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Usun uzytkownika?</DialogTitle>
            <DialogDescription>
              Konto <strong>{deleteConfirmName}</strong> zostanie trwale usuniete. Rekordy instruktora pozostana w systemie bez powiazanego konta.
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
