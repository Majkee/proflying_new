"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useStudents } from "@/lib/hooks/use-students";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentSearch } from "@/components/students/student-search";
import { StudentList } from "@/components/students/student-list";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const { students, loading } = useStudents(search);

  return (
    <div>
      <PageHeader
        title="Kursantki"
        action={
          <Link href="/students/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj
            </Button>
          </Link>
        }
      />

      <div className="mb-4">
        <StudentSearch value={search} onChange={setSearch} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Brak wynikow" : "Brak kursantek"}
          description={
            search
              ? "Sprobuj zmienic wyszukiwanie"
              : "Dodaj pierwsza kursantke do tego studia"
          }
          action={
            !search && (
              <Link href="/students/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj kursantke
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            {students.length} {students.length === 1 ? "kursantka" : "kursantek"}
          </p>
          <StudentList students={students} />
        </>
      )}
    </div>
  );
}
