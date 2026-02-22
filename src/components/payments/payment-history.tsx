"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Payment } from "@/lib/types/database";

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Brak platnosci do wyswietlenia
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{payment.amount} zl</span>
                <Badge variant={payment.method === "cash" ? "secondary" : "outline"}>
                  {payment.method === "cash" ? "Gotowka" : "Przelew"}
                </Badge>
              </div>
              {payment.student && (
                <p className="text-sm text-muted-foreground">{payment.student.full_name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(payment.paid_at).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {payment.notes && (
                <p className="text-xs text-muted-foreground mt-0.5">{payment.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
