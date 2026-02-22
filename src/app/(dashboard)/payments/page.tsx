"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CreditCard, Banknote, ArrowRightLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthlyRevenue, useOverdueStudents } from "@/lib/hooks/use-payments";
import { usePayments } from "@/lib/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentHistory } from "@/components/payments/payment-history";
import { OverdueList } from "@/components/payments/overdue-list";

const MONTH_NAMES = [
  "Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec",
  "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien",
];

export default function PaymentsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { revenue, loading: revenueLoading } = useMonthlyRevenue(year, month);
  const { overdueStudents } = useOverdueStudents();
  const { payments, loading: paymentsLoading } = usePayments();

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div>
      <PageHeader
        title="Platnosci"
        action={
          <Link href="/payments/record">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Zapisz platnosc
            </Button>
          </Link>
        }
      />

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Revenue cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Razem</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueLoading ? "..." : `${revenue.total_amount} zl`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenue.payment_count} platnosci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gotowka</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueLoading ? "..." : `${revenue.cash_amount} zl`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Przelewy</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueLoading ? "..." : `${revenue.transfer_amount} zl`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue list */}
      <div className="mb-8">
        <OverdueList students={overdueStudents} />
      </div>

      {/* Recent payments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ostatnie platnosci</h2>
        {paymentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <PaymentHistory payments={payments.slice(0, 20)} />
        )}
      </div>
    </div>
  );
}
