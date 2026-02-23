"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UnpaidPass {
  pass_id: string;
  student_id: string;
  student_name: string;
  pass_type: string;
  template_name: string | null;
  valid_from: string;
  valid_until: string;
  price_amount: number;
  auto_renew: boolean;
}

interface UnpaidPassesListProps {
  passes: UnpaidPass[];
}

export function UnpaidPassesList({ passes }: UnpaidPassesListProps) {
  if (passes.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-orange-600" />
          Karnety bez platnosci ({passes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {passes.map((p) => (
            <div key={p.pass_id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{p.student_name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.template_name || p.pass_type}
                  {" · "}
                  {new Date(p.valid_from).toLocaleDateString("pl-PL")} – {new Date(p.valid_until).toLocaleDateString("pl-PL")}
                  {" · "}
                  {p.price_amount} zl
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.auto_renew && (
                  <Badge variant="secondary" className="text-xs">Auto</Badge>
                )}
                <Link href={`/payments/record?student=${p.student_id}&pass=${p.pass_id}`}>
                  <Button size="sm" variant="outline">
                    Oplac
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
