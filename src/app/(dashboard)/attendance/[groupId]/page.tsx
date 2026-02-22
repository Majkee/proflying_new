"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AttendanceGrid } from "@/components/attendance/attendance-grid";
import type { Group } from "@/lib/types/database";

export default function AttendanceGroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadGroup() {
      const { data } = await supabase
        .from("groups")
        .select("*, instructor:instructors(id, full_name)")
        .eq("id", params.groupId)
        .single();

      setGroup(data as Group | null);
      setLoading(false);
    }

    loadGroup();
  }, [params.groupId]);

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
        <Link href="/attendance">
          <Button variant="link" className="mt-2">
            Wróc do listy
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/attendance">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>
      <AttendanceGrid
        groupId={group.id}
        groupName={group.name}
        groupCode={group.code}
      />
    </div>
  );
}
