"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { addDays, subDays, format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAttendance, useEnsureSession } from "@/lib/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "./student-row";
import { NoteDialog } from "./note-dialog";
import { SubstituteDialog } from "./substitute-dialog";
import { formatRelativeDate, toDateString } from "@/lib/utils/dates";
import type { Student, AttendanceStatus } from "@/lib/types/database";

interface AttendanceGridProps {
  groupId: string;
  groupName: string;
  groupCode: string;
}

export function AttendanceGrid({ groupId, groupName, groupCode }: AttendanceGridProps) {
  const [date, setDate] = useState(new Date());
  const [members, setMembers] = useState<(Student & { membership_id: string })[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const dateStr = toDateString(date);
  const { sessionId, loading: sessionLoading } = useEnsureSession(groupId, dateStr);
  const { records, toggleAttendance } = useAttendance(sessionId);
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; studentId: string; name: string }>({
    open: false,
    studentId: "",
    name: "",
  });
  const [substituteOpen, setSubstituteOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from("group_memberships")
        .select("id, student:students(id, full_name, phone)")
        .eq("group_id", groupId)
        .eq("is_active", true);

      const memberList =
        (data?.map((m: Record<string, unknown>) => {
          const student = m.student as Record<string, unknown>;
          return {
            ...student,
            membership_id: m.id as string,
          };
        }) ?? []) as (Student & { membership_id: string })[];

      setMembers(memberList);
      setLoadingMembers(false);
    }

    loadMembers();
  }, [groupId]);

  const getStudentStatus = useCallback(
    (studentId: string): AttendanceStatus | null => {
      const record = records.find((r) => r.student_id === studentId);
      return record?.status ?? null;
    },
    [records]
  );

  const getStudentNote = useCallback(
    (studentId: string): string | null => {
      return records.find((r) => r.student_id === studentId)?.note ?? null;
    },
    [records]
  );

  const handleToggle = (studentId: string, status: AttendanceStatus) => {
    toggleAttendance(studentId, status);
  };

  const handleNoteClick = (studentId: string, name: string) => {
    setNoteDialog({ open: true, studentId, name });
  };

  const handleNoteSave = (note: string, status: "excused" | null) => {
    if (status) {
      toggleAttendance(noteDialog.studentId, "excused", note);
    } else {
      // Just update note on existing status
      const currentStatus = getStudentStatus(noteDialog.studentId);
      toggleAttendance(noteDialog.studentId, currentStatus ?? "present", note);
    }
  };

  const handleAddSubstitute = async (name: string) => {
    // Create a temporary student for this session
    // Or use the substitute_name field in attendance
    if (!sessionId) return;

    // Create a placeholder student entry for the substitute
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("full_name", name)
      .eq("studio_id", (await supabase.from("groups").select("studio_id").eq("id", groupId).single()).data?.studio_id)
      .maybeSingle();

    if (student) {
      toggleAttendance(student.id, "present", undefined, true, name);
    } else {
      // Create the student first
      const { data: group } = await supabase
        .from("groups")
        .select("studio_id")
        .eq("id", groupId)
        .single();

      if (group) {
        const { data: newStudent } = await supabase
          .from("students")
          .insert({ full_name: name, studio_id: group.studio_id })
          .select()
          .single();

        if (newStudent) {
          toggleAttendance(newStudent.id, "present", undefined, true, name);
        }
      }
    }
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const totalCount = members.length;

  if (sessionLoading || loadingMembers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-medium">{formatRelativeDate(date)}</p>
          <p className="text-sm text-muted-foreground">{format(date, "dd.MM.yyyy")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Group header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{groupCode}</Badge>
              <CardTitle className="text-lg">{groupName}</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSubstituteOpen(true)}>
              <UserPlus className="mr-1 h-4 w-4" />
              Gosc
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary bar */}
          <div className="flex items-center justify-between py-2 px-2 mb-2 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">
              Obecne: {presentCount}/{totalCount}
            </span>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {records.filter((r) => r.status === "present").length}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {records.filter((r) => r.status === "absent").length}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                {records.filter((r) => r.status === "excused").length}
              </span>
            </div>
          </div>

          {/* Student list */}
          <div className="divide-y">
            {members.map((member) => (
              <StudentRow
                key={member.id}
                studentId={member.id}
                name={member.full_name}
                status={getStudentStatus(member.id)}
                note={getStudentNote(member.id)}
                onToggle={handleToggle}
                onNoteClick={handleNoteClick}
              />
            ))}
            {/* Substitute entries */}
            {records
              .filter((r) => r.is_substitute && !members.find((m) => m.id === r.student_id))
              .map((record) => (
                <StudentRow
                  key={record.id}
                  studentId={record.student_id}
                  name={record.substitute_name ?? "Gosc"}
                  status={record.status}
                  note={record.note}
                  isSubstitute={true}
                  substituteName={record.substitute_name}
                  onToggle={handleToggle}
                  onNoteClick={handleNoteClick}
                />
              ))}
          </div>

          {members.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Brak kursantek w tej grupie
            </p>
          )}
        </CardContent>
      </Card>

      <NoteDialog
        open={noteDialog.open}
        onClose={() => setNoteDialog({ ...noteDialog, open: false })}
        studentName={noteDialog.name}
        currentNote={getStudentNote(noteDialog.studentId) ?? undefined}
        onSave={handleNoteSave}
      />

      <SubstituteDialog
        open={substituteOpen}
        onClose={() => setSubstituteOpen(false)}
        onAdd={handleAddSubstitute}
      />
    </div>
  );
}
