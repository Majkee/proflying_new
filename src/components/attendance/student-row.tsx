"use client";

import { Check, X, MessageSquare, Banknote } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/lib/types/database";

interface StudentRowProps {
  studentId: string;
  name: string;
  status: AttendanceStatus | null;
  note?: string | null;
  isSubstitute?: boolean;
  substituteName?: string | null;
  passStatus?: "expired" | "expiring" | null;
  passValidUntil?: string | null;
  onToggle: (studentId: string, status: AttendanceStatus) => void;
  onNoteClick: (studentId: string, name: string) => void;
  onPaymentClick?: (studentId: string, name: string) => void;
}

export function StudentRow({
  studentId,
  name,
  status,
  note,
  isSubstitute,
  substituteName,
  passStatus,
  passValidUntil,
  onToggle,
  onNoteClick,
  onPaymentClick,
}: StudentRowProps) {
  return (
    <div data-testid="attendance-student-row" className="flex items-center gap-3 py-3 px-2 border-b last:border-b-0">
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
        {passStatus === "expired" && (
          <Badge className="mt-0.5 bg-red-100 text-red-700 border-transparent text-[10px] px-1.5 py-0">
            Brak karnetu{passValidUntil ? ` (${format(new Date(passValidUntil), "dd.MM.yyyy")})` : ""}
          </Badge>
        )}
        {passStatus === "expiring" && passValidUntil && (
          <Badge className="mt-0.5 bg-orange-100 text-orange-700 border-transparent text-[10px] px-1.5 py-0">
            Karnet wygasa {format(new Date(passValidUntil), "dd.MM.yyyy")}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onPaymentClick && (
          <button
            onClick={() => onPaymentClick(studentId, name)}
            className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
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
