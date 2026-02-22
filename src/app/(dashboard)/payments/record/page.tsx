"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/payments/payment-form";

export default function RecordPaymentPage() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("student") ?? undefined;
  const preselectedPassId = searchParams.get("pass") ?? undefined;

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
      <PaymentForm preselectedStudentId={preselectedStudentId} preselectedPassId={preselectedPassId} />
    </div>
  );
}
