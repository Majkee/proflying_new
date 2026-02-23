import type { Metadata } from "next";
import { AttendancePageContent } from "@/components/attendance/attendance-page-content";

export const metadata: Metadata = {
  title: "Obecnosc",
};

export default function AttendancePage() {
  return <AttendancePageContent />;
}
