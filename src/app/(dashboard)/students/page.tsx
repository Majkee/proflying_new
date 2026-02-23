import type { Metadata } from "next";
import { StudentsPageContent } from "@/components/students/students-page-content";

export const metadata: Metadata = {
  title: "Kursantki",
};

export default function StudentsPage() {
  return <StudentsPageContent />;
}
