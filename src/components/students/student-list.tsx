"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StudentWithPassStatus } from "@/lib/hooks/use-students";

interface StudentListProps {
  students: StudentWithPassStatus[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
}

function formatPassLabel(s: StudentWithPassStatus): string {
  if (s.template_name) return s.template_name;
  switch (s.pass_type) {
    case "monthly_1x": return "1x/tydzien";
    case "monthly_2x": return "2x/tydzien";
    case "single_entry": return "Jednorazowy";
    default: return "Indywidualny";
  }
}

export function StudentList({ students }: StudentListProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="divide-y rounded-lg border">
      {students.map((s) => {
        const hasPass = s.pass_id !== null;
        const isExpired = hasPass && s.valid_until !== null && s.valid_until < today;

        return (
          <Link
            key={s.student_id}
            href={`/students/${s.student_id}`}
            data-testid="student-row"
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              {/* Row 1: Name */}
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{s.full_name}</p>
                {hasPass && s.price_amount !== null && (
                  <span className="text-sm font-semibold whitespace-nowrap">{s.price_amount} zl</span>
                )}
              </div>

              {/* Row 2: Contact + payment status */}
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <div className="flex items-center gap-2">
                  {s.phone && (
                    <span className="text-sm text-muted-foreground">{s.phone}</span>
                  )}
                  {s.email && (
                    <span className="text-sm text-muted-foreground">{s.email}</span>
                  )}
                </div>
                {hasPass && (
                  <div className="flex-shrink-0">
                    {isExpired ? (
                      <Badge variant="destructive">Wygasl</Badge>
                    ) : s.is_paid ? (
                      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">Oplacony</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">Nieoplacony</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: Pass info or "Brak karnetu" */}
              <div className="flex items-center justify-between gap-2 mt-0.5">
                {hasPass ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {formatPassLabel(s)}
                      {s.valid_from && s.valid_until && (
                        <> · {formatDate(s.valid_from)} – {formatDate(s.valid_until)}</>
                      )}
                    </span>
                    {s.auto_renew && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Auto</Badge>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Brak karnetu</span>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
          </Link>
        );
      })}
    </div>
  );
}
