"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { Student } from "@/lib/types/database";

interface RosterMember {
  id: string;
  student_id: string;
  student: Student;
}

interface GroupRosterProps {
  groupId: string;
}

export function GroupRoster({ groupId }: GroupRosterProps) {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const { activeStudio } = useStudio();

  const loadMembers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("group_memberships")
      .select("id, student_id, student:students(id, full_name, phone)")
      .eq("group_id", groupId)
      .eq("is_active", true);

    setMembers((data as unknown as RosterMember[]) ?? []);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const openAddDialog = async () => {
    if (!activeStudio) return;

    const supabase = createClient();
    const memberIds = members.map((m) => m.student_id);
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("studio_id", activeStudio.id)
      .eq("is_active", true)
      .order("full_name");

    setAvailableStudents(
      (data ?? []).filter((s) => !memberIds.includes(s.id))
    );
    setSelectedStudentId("");
    setAddOpen(true);
  };

  const handleAdd = async () => {
    if (!selectedStudentId) return;

    const supabase = createClient();
    await supabase.from("group_memberships").insert({
      student_id: selectedStudentId,
      group_id: groupId,
    });

    setAddOpen(false);
    loadMembers();
  };

  const handleRemove = async (membershipId: string) => {
    const supabase = createClient();
    await supabase
      .from("group_memberships")
      .update({ is_active: false, left_at: new Date().toISOString().split("T")[0] })
      .eq("id", membershipId);

    loadMembers();
  };

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Kursantki ({members.length})
        </CardTitle>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="mr-1 h-4 w-4" />
          Dodaj
        </Button>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Brak kursantek w tej grupie
          </p>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{member.student.full_name}</p>
                  {member.student.phone && (
                    <p className="text-sm text-muted-foreground">{member.student.phone}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj kursantke do grupy</DialogTitle>
            <DialogDescription>Wybierz kursantke z listy</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kursantke..." />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStudents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Wszystkie kursantki sa juz w tej grupie
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleAdd} disabled={!selectedStudentId}>
                Dodaj
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
