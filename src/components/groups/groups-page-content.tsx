"use client";

import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { useGroups } from "@/lib/hooks/use-groups";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { GroupList } from "@/components/groups/group-list";
import { ErrorCard } from "@/components/shared/error-card";

export function GroupsPageContent() {
  const { groups, loading, error, refetch } = useGroups();

  return (
    <div>
      <PageHeader
        title="Grupy"
        action={
          <Link href="/groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj
            </Button>
          </Link>
        }
      />

      {error ? (
        <ErrorCard message="Nie udalo sie zaladowac grup" onRetry={refetch} />
      ) : loading ? (
        <LoadingSpinner />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Brak grup"
          description="Dodaj pierwsza grupe do tego studia"
          action={
            <Link href="/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj grupe
              </Button>
            </Link>
          }
        />
      ) : (
        <GroupList groups={groups} onDeactivated={refetch} />
      )}
    </div>
  );
}
