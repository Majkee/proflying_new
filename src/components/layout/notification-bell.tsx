"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, Cake } from "lucide-react";
import { parseISO, differenceInYears, addDays, format } from "date-fns";
import { pl } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BirthdayNotification {
  id: string;
  studentId: string;
  studentName: string;
  date: Date;
  age: number;
  isToday: boolean;
}

export function NotificationBell() {
  const { activeStudio } = useStudio();
  const [notifications, setNotifications] = useState<BirthdayNotification[]>([]);
  const [open, setOpen] = useState(false);

  const loadBirthdays = useCallback(async () => {
    if (!activeStudio) {
      setNotifications([]);
      return;
    }

    const supabase = createClient();
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, date_of_birth")
      .eq("studio_id", activeStudio.id)
      .eq("is_active", true)
      .not("date_of_birth", "is", null);

    if (!students) {
      setNotifications([]);
      return;
    }

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const result: BirthdayNotification[] = [];

    // Check today + next 7 days
    for (let offset = 0; offset <= 7; offset++) {
      const checkDate = addDays(today, offset);
      const checkMonth = checkDate.getMonth();
      const checkDay = checkDate.getDate();

      for (const s of students) {
        if (!s.date_of_birth) continue;
        const dob = parseISO(s.date_of_birth);
        if (dob.getMonth() === checkMonth && dob.getDate() === checkDay) {
          const age = differenceInYears(checkDate, dob);
          result.push({
            id: `${s.id}-${offset}`,
            studentId: s.id,
            studentName: s.full_name,
            date: checkDate,
            age,
            isToday: offset === 0,
          });
        }
      }
    }

    setNotifications(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudio?.id]);

  useEffect(() => {
    loadBirthdays();
  }, [loadBirthdays]);

  const todayCount = notifications.filter((n) => n.isToday).length;
  const totalCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
              {totalCount}
            </span>
          )}
          <span className="sr-only">Powiadomienia</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Powiadomienia</h3>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Brak powiadomien
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {/* Today's birthdays */}
            {todayCount > 0 && (
              <div>
                <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                  Dzisiaj
                </div>
                {notifications
                  .filter((n) => n.isToday)
                  .map((n) => (
                    <BirthdayRow key={n.id} notification={n} onNavigate={() => setOpen(false)} />
                  ))}
              </div>
            )}
            {/* Upcoming birthdays */}
            {notifications.some((n) => !n.isToday) && (
              <div>
                <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                  Nadchodzace
                </div>
                {notifications
                  .filter((n) => !n.isToday)
                  .map((n) => (
                    <BirthdayRow key={n.id} notification={n} onNavigate={() => setOpen(false)} />
                  ))}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function BirthdayRow({
  notification,
  onNavigate,
}: {
  notification: BirthdayNotification;
  onNavigate: () => void;
}) {
  const ageLabel = notification.age === 1
    ? "rok"
    : notification.age < 5
      ? "lata"
      : "lat";
  const dateLabel = notification.isToday
    ? "Dzisiaj"
    : format(notification.date, "EEEE, d MMM", { locale: pl });

  return (
    <Link
      href={`/students/${notification.studentId}`}
      onClick={onNavigate}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 flex-shrink-0 mt-0.5">
        <Cake className="h-4 w-4 text-pink-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{notification.studentName}</p>
        <p className="text-xs text-muted-foreground">
          {notification.age > 0 && (
            <span className="font-medium text-pink-600">{notification.age} {ageLabel}</span>
          )}
          {notification.age > 0 && " · "}
          <span className="capitalize">{dateLabel}</span>
        </p>
      </div>
    </Link>
  );
}
