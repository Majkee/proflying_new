"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Student } from "@/lib/types/database";

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  return (
    <div className="divide-y rounded-lg border">
      {students.map((student) => (
        <Link
          key={student.id}
          href={`/students/${student.id}`}
          className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{student.full_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {student.phone && (
                <span className="text-sm text-muted-foreground">{student.phone}</span>
              )}
              {student.email && (
                <span className="text-sm text-muted-foreground">{student.email}</span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}
