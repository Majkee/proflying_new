import type { Metadata } from "next";
import { SchedulePageContent } from "@/components/schedule/schedule-page-content";

export const metadata: Metadata = {
  title: "Grafik",
};

export default function SchedulePage() {
  return <SchedulePageContent />;
}
