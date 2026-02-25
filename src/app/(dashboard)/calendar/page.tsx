import type { Metadata } from "next";
import { CalendarPageContent } from "@/components/calendar/calendar-page-content";

export const metadata: Metadata = {
  title: "Kalendarz",
};

export default function CalendarPage() {
  return <CalendarPageContent />;
}
