"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>
      <StudentForm />
    </div>
  );
}
