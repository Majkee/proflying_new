import type { Metadata } from "next";
import { PaymentsPageContent } from "@/components/payments/payments-page-content";

export const metadata: Metadata = {
  title: "Platnosci",
};

export default function PaymentsPage() {
  return <PaymentsPageContent />;
}
