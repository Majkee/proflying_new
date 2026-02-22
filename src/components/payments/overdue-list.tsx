"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OverdueStudent {
  student_id: string;
  student_name: string;
  last_pass_end: string | null;
  pass_type: string | null;
}

interface OverdueListProps {
  students: OverdueStudent[];
}

export function OverdueList({ students }: OverdueListProps) {
  if (students.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Zaleglosci ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {students.map((s) => (
            <div key={s.student_id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{s.student_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.last_pass_end
                    ? `Karnet wygasl: ${new Date(s.last_pass_end).toLocaleDateString("pl-PL")}`
                    : "Brak karnetu"}
                </p>
              </div>
              <Link href={`/students/${s.student_id}?tab=passes`}>
                <Button size="sm" variant="outline">
                  Oplac
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
