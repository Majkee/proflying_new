"use client";

import { Check, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { AttendanceStatus } from "@/lib/types/database";

interface StudentRowProps {
  studentId: string;
  name: string;
  status: AttendanceStatus | null;
  note?: string | null;
  isSubstitute?: boolean;
  substituteName?: string | null;
  onToggle: (studentId: string, status: AttendanceStatus) => void;
  onNoteClick: (studentId: string, name: string) => void;
}

export function StudentRow({
  studentId,
  name,
  status,
  note,
  isSubstitute,
  substituteName,
  onToggle,
  onNoteClick,
}: StudentRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isSubstitute && "italic")}>
          {isSubstitute && substituteName ? substituteName : name}
          {isSubstitute && (
            <span className="text-xs text-muted-foreground ml-1">(gosc)</span>
          )}
        </p>
        {note && (
          <p className="text-xs text-muted-foreground truncate">{note}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onNoteClick(studentId, name)}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <MessageSquare className={cn("h-4 w-4", note ? "text-primary" : "text-muted-foreground")} />
        </button>
        <Button
          variant={status === "present" ? "default" : "outline"}
          size="icon-lg"
          className={cn(
            "rounded-xl transition-all",
            status === "present" && "bg-green-500 hover:bg-green-600 text-white"
          )}
          onClick={() => onToggle(studentId, status === "present" ? "absent" : "present")}
        >
          <Check className="h-6 w-6" />
        </Button>
        <Button
          variant={status === "absent" ? "default" : "outline"}
          size="icon-lg"
          className={cn(
            "rounded-xl transition-all",
            status === "absent" && "bg-red-500 hover:bg-red-600 text-white"
          )}
          onClick={() => onToggle(studentId, status === "absent" ? "present" : "absent")}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
