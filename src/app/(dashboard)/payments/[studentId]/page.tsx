"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useStudent } from "@/lib/hooks/use-students";
import { usePayments } from "@/lib/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentHistory } from "@/components/payments/payment-history";

export default function StudentPaymentsPage({
  params,
}: {
  params: { studentId: string };
}) {
  const { student, loading: studentLoading } = useStudent(params.studentId);
  const { payments, loading: paymentsLoading } = usePayments(params.studentId);

  if (studentLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/payments">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Platnosci - ${student?.full_name ?? ""}`}
        action={
          <Link href={`/payments/record?student=${params.studentId}`}>
            <Button size="sm">Zapisz platnosc</Button>
          </Link>
        }
      />

      <PaymentHistory payments={payments} />
    </div>
  );
}
