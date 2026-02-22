"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { LevelBadge } from "@/components/shared/badges";
import { GroupRoster } from "@/components/groups/group-roster";
import { GroupForm } from "@/components/groups/group-form";
import { formatTime } from "@/lib/utils/dates";
import { getDayLabel } from "@/lib/constants/days";
import type { Group } from "@/lib/types/database";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadGroup() {
      const { data } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name)")
        .eq("id", groupId)
        .single();

      setGroup(data as Group | null);
      setLoading(false);
    }

    loadGroup();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono grupy</p>
        <Link href="/groups">
          <Button variant="link" className="mt-2">Wróc do listy</Button>
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </div>
        <GroupForm group={group} onSuccess={() => { setEditing(false); window.location.reload(); }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/groups">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>

      <PageHeader
        title={group.name}
        action={
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edytuj
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant="secondary">{group.code}</Badge>
        <LevelBadge level={group.level} />
        <Badge variant="outline">{getDayLabel(group.day_of_week)}</Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(group.start_time)} - {formatTime(group.end_time)}
        </div>
      </div>

      {group.instructor && (
        <p className="text-sm text-muted-foreground mb-6">
          Instruktor: <span className="font-medium text-foreground">{group.instructor.full_name}</span>
        </p>
      )}

      <div className="space-y-6">
        <GroupRoster groupId={group.id} />

        <div className="flex gap-2">
          <Link href={`/attendance/${group.id}`}>
            <Button>Sprawdz obecnosc</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
