import type { Metadata } from "next";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";

export const metadata: Metadata = {
  title: "Pulpit",
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
