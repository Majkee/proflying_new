"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CreditCard, Banknote, ArrowRightLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMonthlyRevenue, useOverdueStudents, useUnpaidPasses } from "@/lib/hooks/use-payments";
import { usePayments, usePaymentsCount } from "@/lib/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorCard } from "@/components/shared/error-card";
import { PaymentHistory } from "@/components/payments/payment-history";
import { OverdueList } from "@/components/payments/overdue-list";
import { UnpaidPassesList } from "@/components/payments/unpaid-passes-list";

const MONTH_NAMES = [
  "Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec",
  "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien",
];

const PAGE_SIZE = 20;

export function PaymentsPageContent() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { revenue, loading: revenueLoading, error: revenueError } = useMonthlyRevenue(year, month);
  const { overdueStudents } = useOverdueStudents();
  const { unpaidPasses } = useUnpaidPasses();
  const { payments, loading: paymentsLoading, error: paymentsError, refetch } = usePayments(
    undefined,
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE }
  );
  const { count: totalCount } = usePaymentsCount();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
      {revenueError ? (
        <ErrorCard message="Nie udalo sie zaladowac przychodu" />
      ) : (
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
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj kursantki..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Unpaid passes */}
      <div className="mb-6">
        <UnpaidPassesList
          passes={unpaidPasses.filter((p) => {
            if (!search.trim()) return true;
            return p.student_name.toLowerCase().includes(search.toLowerCase());
          })}
        />
      </div>

      {/* Overdue list */}
      <div className="mb-8">
        <OverdueList
          students={overdueStudents.filter((s) => {
            if (!search.trim()) return true;
            return s.student_name.toLowerCase().includes(search.toLowerCase());
          })}
        />
      </div>

      {/* Recent payments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ostatnie platnosci</h2>
        {paymentsError ? (
          <ErrorCard message="Nie udalo sie zaladowac platnosci" onRetry={refetch} />
        ) : paymentsLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <PaymentHistory payments={payments} />
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Poprzednia
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Nastepna
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
