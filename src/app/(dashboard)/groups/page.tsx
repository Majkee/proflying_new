"use client";

import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { useGroups } from "@/lib/hooks/use-groups";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GroupList } from "@/components/groups/group-list";

export default function GroupsPage() {
  const { groups, loading } = useGroups();

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
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
        <GroupList groups={groups} />
      )}
    </div>
  );
}
