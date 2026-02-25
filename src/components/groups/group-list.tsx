"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Clock, Users, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LevelBadge } from "@/components/shared/badges";
import { formatTime } from "@/lib/utils/dates";
import { getDayLabel } from "@/lib/constants/days";
import type { Group } from "@/lib/types/database";

interface GroupListProps {
  groups: Group[];
  showDay?: boolean;
  onDeactivated?: () => void;
}

export function GroupList({ groups, showDay = true, onDeactivated }: GroupListProps) {
  const [confirmGroup, setConfirmGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<{ members: number; sessions: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const openConfirm = useCallback(
    async (group: Group) => {
      setConfirmGroup(group);
      setStats(null);
      setLoadingStats(true);

      const supabase = createClient();
      const [membersRes, sessionsRes] = await Promise.all([
        supabase
          .from("group_memberships")
          .select("id", { count: "exact", head: true })
          .eq("group_id", group.id)
          .eq("is_active", true),
        supabase
          .from("class_sessions")
          .select("id", { count: "exact", head: true })
          .eq("group_id", group.id),
      ]);

      setStats({
        members: membersRes.count ?? 0,
        sessions: sessionsRes.count ?? 0,
      });
      setLoadingStats(false);
    },
    []
  );

  const handleDeactivate = useCallback(async () => {
    if (!confirmGroup) return;
    setDeactivating(true);

    const supabase = createClient();
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Soft-delete the group
    await supabase
      .from("groups")
      .update({ is_active: false })
      .eq("id", confirmGroup.id);

    // 2. Deactivate all active memberships
    await supabase
      .from("group_memberships")
      .update({ is_active: false, left_at: todayStr })
      .eq("group_id", confirmGroup.id)
      .eq("is_active", true);

    // 3. Cancel future sessions
    await supabase
      .from("class_sessions")
      .update({ is_cancelled: true })
      .eq("group_id", confirmGroup.id)
      .gt("session_date", todayStr);

    setDeactivating(false);
    setConfirmGroup(null);
    onDeactivated?.();
  }, [confirmGroup, onDeactivated]);

  // Group by day of week
  const byDay = groups.reduce(
    (acc, g) => {
      const day = g.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(g);
      return acc;
    },
    {} as Record<number, Group[]>
  );

  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <>
      <div className="space-y-6">
        {dayOrder.map((day) => {
          const dayGroups = byDay[day];
          if (!dayGroups || dayGroups.length === 0) return null;

          return (
            <div key={day}>
              {showDay && (
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {getDayLabel(day)}
                </h3>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dayGroups.map((group) => (
                  <div key={group.id} data-testid="group-card" className="relative group/card">
                    <Link href={`/groups/${group.id}`}>
                      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{group.code}</Badge>
                            <LevelBadge level={group.level} />
                          </div>
                          <h4 className="font-medium mb-1">{group.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(group.start_time)} - {formatTime(group.end_time)}
                          </div>
                          {group.instructor && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {group.instructor.full_name}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                            <Users className="h-3.5 w-3.5" />
                            {group.member_count ?? 0}/{group.capacity}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openConfirm(group);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border opacity-0 group-hover/card:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 hover:border-red-300"
                      title="Dezaktywuj grupe"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deactivation confirmation dialog */}
      <Dialog open={!!confirmGroup} onOpenChange={(open) => !open && setConfirmGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Dezaktywuj grupe
            </DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz dezaktywowac grupe{" "}
              <span className="font-semibold text-foreground">{confirmGroup?.code} — {confirmGroup?.name}</span>?
            </DialogDescription>
          </DialogHeader>

          {loadingStats ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : stats && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
              <p>Aktywnych czlonkow: <span className="font-semibold">{stats.members}</span></p>
              <p>Sesji ogolem: <span className="font-semibold">{stats.sessions}</span></p>
              <p className="text-muted-foreground text-xs mt-2">
                Grupa zostanie ukryta, czlonkostwa dezaktywowane, a przyszle sesje anulowane. Historia pozostanie nienaruszona.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGroup(null)} disabled={deactivating}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={loadingStats || deactivating}
            >
              {deactivating ? "Dezaktywacja..." : "Dezaktywuj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
