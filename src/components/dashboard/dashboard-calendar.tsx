"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Cake,
  X,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  getMonth,
  getDate,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  differenceInYears,
  parseISO,
  format,
} from "date-fns";
import { pl } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { formatMonthYear, formatTime } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { WeekView } from "./week-view";
import type { PublicHoliday, Student, Group } from "@/lib/types/database";

const WEEKDAY_LABELS = ["Pon", "Wt", "Sr", "Czw", "Pt", "Sob", "Nd"];
const MAX_VISIBLE_EVENTS = 3;

interface EventItem {
  id: string;
  type: "holiday" | "class" | "birthday";
  label: string;
  sublabel?: string;
  href?: string;
}

interface DayData {
  date: Date;
  events: EventItem[];
}

type ViewMode = "month" | "week";

export function DashboardCalendar({ studioId, hideLinks }: { studioId: string; hideLinks?: boolean }) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { data: holidays } = useSupabaseQuery<PublicHoliday[]>(
    async () => {
      let rangeStart: Date, rangeEnd: Date;
      if (viewMode === "month") {
        rangeStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        rangeEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
      } else {
        rangeStart = currentWeekStart;
        rangeEnd = addDays(currentWeekStart, 5);
      }

      const supabase = createClient();
      const startStr = `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, "0")}-${String(rangeStart.getDate()).padStart(2, "0")}`;
      const endStr = `${rangeEnd.getFullYear()}-${String(rangeEnd.getMonth() + 1).padStart(2, "0")}-${String(rangeEnd.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("public_holidays")
        .select("*")
        .gte("holiday_date", startStr)
        .lte("holiday_date", endStr)
        .order("holiday_date");

      return data ?? [];
    },
    [viewMode, currentMonth, currentWeekStart],
    []
  );

  useEffect(() => {
    const supabase = createClient();

    async function loadStaticData() {
      const [studentsRes, groupsRes] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name, date_of_birth")
          .eq("studio_id", studioId)
          .eq("is_active", true)
          .not("date_of_birth", "is", null),
        supabase
          .from("groups")
          .select("*")
          .eq("studio_id", studioId)
          .eq("is_active", true)
          .order("start_time"),
      ]);

      setStudents((studentsRes.data as Student[]) ?? []);
      setGroups((groupsRes.data as Group[]) ?? []);
      setInitialLoaded(true);
    }

    loadStaticData();
  }, [studioId]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const getEventsForDay = useCallback(
    (date: Date): EventItem[] => {
      const events: EventItem[] = [];
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // Holidays first (full-width red)
      for (const h of holidays) {
        if (h.holiday_date === dateStr) {
          events.push({
            id: `h-${h.id}`,
            type: "holiday",
            label: h.name,
          });
        }
      }

      // Classes
      const jsDow = getDay(date);
      for (const g of groups) {
        if (g.day_of_week === jsDow) {
          events.push({
            id: `c-${g.id}`,
            type: "class",
            label: `${formatTime(g.start_time)} ${g.code}`,
            sublabel: g.name,
            href: hideLinks ? undefined : `/groups/${g.id}`,
          });
        }
      }

      // Birthdays
      const month = getMonth(date);
      const day = getDate(date);
      for (const s of students) {
        if (!s.date_of_birth) continue;
        const dob = parseISO(s.date_of_birth);
        if (getMonth(dob) === month && getDate(dob) === day) {
          const age = differenceInYears(date, dob);
          events.push({
            id: `b-${s.id}`,
            type: "birthday",
            label: s.full_name,
            sublabel: age > 0 ? `${age} ${age === 1 ? "rok" : age < 5 ? "lata" : "lat"}` : undefined,
            href: hideLinks ? undefined : `/students/${s.id}`,
          });
        }
      }

      return events;
    },
    [holidays, groups, students, hideLinks]
  );

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentMonth((m) => subMonths(m, 1));
    } else {
      setCurrentWeekStart((w) => subWeeks(w, 1));
    }
    setExpandedDate(null);
  };
  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentMonth((m) => addMonths(m, 1));
    } else {
      setCurrentWeekStart((w) => addWeeks(w, 1));
    }
    setExpandedDate(null);
  };
  const handleToday = () => {
    if (viewMode === "month") {
      setCurrentMonth(startOfMonth(new Date()));
    } else {
      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    }
    setExpandedDate(null);
  };

  const weekEndDate = addDays(currentWeekStart, 5);
  const weekRangeLabel = (() => {
    const startDay = format(currentWeekStart, "d", { locale: pl });
    const endFormatted = format(weekEndDate, "d MMM yyyy", { locale: pl });
    if (currentWeekStart.getMonth() === weekEndDate.getMonth()) {
      return `${startDay} – ${endFormatted}`;
    }
    const startFormatted = format(currentWeekStart, "d MMM", { locale: pl });
    return `${startFormatted} – ${endFormatted}`;
  })();

  if (!initialLoaded) {
    return (
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold capitalize">
            {viewMode === "month" ? formatMonthYear(currentMonth) : weekRangeLabel}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-md border mr-1">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 text-xs font-medium rounded-l-md transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Miesiac
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 text-xs font-medium rounded-r-md transition-colors ${
                viewMode === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tydzien
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Dzisiaj
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "week" ? (
        <WeekView
          weekStart={currentWeekStart}
          groups={groups}
          holidays={holidays}
          students={students}
          hideLinks={hideLinks}
        />
      ) : (
        <>
          {/* Weekday header row */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`py-2 text-center text-xs font-medium text-muted-foreground ${
                  i < 6 ? "border-r" : ""
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className={`grid grid-cols-7 ${weekIdx < weeks.length - 1 ? "border-b" : ""}`}>
              {week.map((day, dayIdx) => {
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const events = getEventsForDay(day).filter((e) => e.type !== "class");
                const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
                const hiddenCount = events.length - MAX_VISIBLE_EVENTS;
                const isExpanded = expandedDate && isSameDay(day, expandedDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-1 ${dayIdx < 6 ? "border-r" : ""} ${
                      !inMonth ? "bg-muted/30" : ""
                    } ${today ? "bg-blue-50/50" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-start mb-0.5 px-1">
                      <span
                        className={`text-xs leading-6 ${
                          today
                            ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-semibold"
                            : !inMonth
                              ? "text-muted-foreground/50"
                              : "text-muted-foreground"
                        }`}
                      >
                        {getDate(day)}
                      </span>
                    </div>

                    {/* Event chips */}
                    <div className="space-y-0.5">
                      {visibleEvents.map((event) => (
                        <EventChip key={event.id} event={event} />
                      ))}
                      {hiddenCount > 0 && !isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedDate(day)}
                          className="w-full text-left text-[10px] font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                        >
                          +{hiddenCount} wiecej
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Expanded day popover */}
          {expandedDate && (
            <ExpandedDayPanel
              date={expandedDate}
              events={getEventsForDay(expandedDate).filter((e) => e.type !== "class")}
              onClose={() => setExpandedDate(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

function EventChip({ event }: { event: EventItem }) {
  const colorClasses = {
    holiday: "bg-red-100 text-red-800 border-l-red-500",
    class: "bg-blue-100 text-blue-800 border-l-blue-500",
    birthday: "bg-pink-100 text-pink-800 border-l-pink-500",
  };

  const content = (
    <div
      className={`text-[10px] leading-tight truncate rounded-sm px-1.5 py-0.5 border-l-2 ${colorClasses[event.type]} ${
        event.href ? "hover:opacity-80 cursor-pointer" : ""
      }`}
      title={event.sublabel ? `${event.label} — ${event.sublabel}` : event.label}
    >
      {event.type === "birthday" && <Cake className="inline-block h-2.5 w-2.5 mr-0.5 -mt-px" />}
      {event.label}
    </div>
  );

  if (event.href) {
    return <Link href={event.href}>{content}</Link>;
  }
  return content;
}

function ExpandedDayPanel({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: EventItem[];
  onClose: () => void;
}) {
  const dateLabel = date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="border-t px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold capitalize">{dateLabel}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {events.map((event) => (
          <ExpandedEventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function ExpandedEventRow({ event }: { event: EventItem }) {
  const dotColor = {
    holiday: "bg-red-500",
    class: "bg-blue-500",
    birthday: "bg-pink-500",
  };

  const content = (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted text-sm transition-colors">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[event.type]}`} />
      <span className="truncate">{event.label}</span>
      {event.sublabel && (
        <span className="text-muted-foreground text-xs truncate">
          {event.sublabel}
        </span>
      )}
    </div>
  );

  if (event.href) {
    return <Link href={event.href}>{content}</Link>;
  }
  return content;
}
