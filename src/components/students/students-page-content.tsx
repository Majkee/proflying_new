"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useStudentsWithPassStatus } from "@/lib/hooks/use-students";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StudentSearch } from "@/components/students/student-search";
import { StudentList } from "@/components/students/student-list";
import { ErrorCard } from "@/components/shared/error-card";

export function StudentsPageContent() {
  const [search, setSearch] = useState("");
  const { students, loading, error, refetch } = useStudentsWithPassStatus(search);

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

      {error ? (
        <ErrorCard message="Nie udalo sie zaladowac kursantek" onRetry={refetch} />
      ) : loading ? (
        <LoadingSpinner />
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
