"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { addDays, isSameDay, getDay, getMonth, getDate, parseISO, differenceInYears } from "date-fns";
import { Cake } from "lucide-react";
import { formatTime } from "@/lib/utils/dates";
import type { PublicHoliday, Student, Group } from "@/lib/types/database";

const PX_PER_MINUTE = 64 / 60;

const DAY_LABELS = ["Pon", "Wt", "Sr", "Czw", "Pt", "Sob"];

interface WeekViewProps {
  weekStart: Date;
  groups: Group[];
  holidays: PublicHoliday[];
  students: Student[];
  hideLinks?: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function WeekView({ weekStart, groups, holidays, students, hideLinks }: WeekViewProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // 6 days: Mon–Sat
  const days = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Derive hour range from groups
  const { gridStartMinute, gridEndMinute, hours } = useMemo(() => {
    if (groups.length === 0) {
      return { gridStartMinute: 14 * 60, gridEndMinute: 22 * 60, hours: [14, 15, 16, 17, 18, 19, 20, 21] };
    }
    let earliest = 24 * 60;
    let latest = 0;
    for (const g of groups) {
      const s = timeToMinutes(g.start_time);
      const e = timeToMinutes(g.end_time);
      if (s < earliest) earliest = s;
      if (e > latest) latest = e;
    }
    const startHour = Math.max(0, Math.floor(earliest / 60) - 1);
    const endHour = Math.min(24, Math.ceil(latest / 60) + 1);
    const hrs: number[] = [];
    for (let h = startHour; h < endHour; h++) hrs.push(h);
    return { gridStartMinute: startHour * 60, gridEndMinute: endHour * 60, hours: hrs };
  }, [groups]);

  const gridHeight = (gridEndMinute - gridStartMinute) * PX_PER_MINUTE;

  // Groups by day-of-week
  const groupsByDow = useMemo(() => {
    const map = new Map<number, Group[]>();
    for (const g of groups) {
      const arr = map.get(g.day_of_week) ?? [];
      arr.push(g);
      map.set(g.day_of_week, arr);
    }
    return map;
  }, [groups]);

  // Holiday lookup by date string
  const holidayMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of holidays) {
      map.set(h.holiday_date, h.name);
    }
    return map;
  }, [holidays]);

  // Birthday lookup by "month-day" → list of { name, age }
  const birthdayMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; age: number }[]>();
    for (const s of students) {
      if (!s.date_of_birth) continue;
      const dob = parseISO(s.date_of_birth);
      const key = `${getMonth(dob)}-${getDate(dob)}`;
      const arr = map.get(key) ?? [];
      arr.push({ id: s.id, name: s.full_name, age: differenceInYears(new Date(), dob) });
      map.set(key, arr);
    }
    return map;
  }, [students]);

  // Current time line position
  const isCurrentWeek = days.some((d) => isSameDay(d, now));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showTimeLine = isCurrentWeek && nowMinutes >= gridStartMinute && nowMinutes <= gridEndMinute;
  const timeLineTop = (nowMinutes - gridStartMinute) * PX_PER_MINUTE;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Column headers */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b">
          {/* Empty corner */}
          <div className="border-r" />
          {days.map((day, i) => {
            const today = isSameDay(day, now);
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const holidayName = holidayMap.get(dateStr);
            const bdayKey = `${getMonth(day)}-${getDate(day)}`;
            const birthdays = birthdayMap.get(bdayKey);

            return (
              <div
                key={i}
                className={`py-2 px-1 text-center ${i < 5 ? "border-r" : ""} ${
                  today ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-xs font-medium ${today ? "text-blue-600" : "text-muted-foreground"}`}>
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      today
                        ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {getDate(day)}
                  </span>
                </div>
                {holidayName && (
                  <div className="text-[10px] text-red-600 truncate mt-0.5" title={holidayName}>
                    {holidayName}
                  </div>
                )}
                {birthdays && birthdays.length > 0 && (
                  <div className="mt-0.5">
                    {birthdays.map((b) => {
                      const content = (
                        <>
                          <Cake className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate">{b.name.split(" ")[0]}</span>
                        </>
                      );
                      const title = `${b.name} — ${b.age} ${b.age === 1 ? "rok" : b.age < 5 ? "lata" : "lat"}`;
                      return hideLinks ? (
                        <div
                          key={b.id}
                          className="flex items-center justify-center gap-0.5 text-[10px] text-pink-600 truncate"
                          title={title}
                        >
                          {content}
                        </div>
                      ) : (
                        <Link
                          key={b.id}
                          href={`/students/${b.id}`}
                          className="flex items-center justify-center gap-0.5 text-[10px] text-pink-600 hover:text-pink-800 truncate"
                          title={title}
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[60px_repeat(6,1fr)]" style={{ height: gridHeight }}>
          {/* Hour labels + horizontal lines */}
          {hours.map((hour) => {
            const top = (hour * 60 - gridStartMinute) * PX_PER_MINUTE;
            return (
              <div key={hour} className="contents">
                <div
                  className="absolute left-0 w-[60px] text-right pr-2 text-xs text-muted-foreground -translate-y-1/2 pointer-events-none"
                  style={{ top }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div
                  className="absolute left-[60px] right-0 border-t border-border/50 pointer-events-none"
                  style={{ top }}
                />
              </div>
            );
          })}

          {/* Day columns */}
          {days.map((day, colIdx) => {
            const dow = getDay(day);
            const dayGroups = groupsByDow.get(dow) ?? [];
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const isHoliday = holidayMap.has(dateStr);
            const today = isSameDay(day, now);

            // Detect overlaps: simple greedy algorithm
            const positioned = computeOverlaps(dayGroups, gridStartMinute);

            return (
              <div
                key={colIdx}
                className={`relative ${colIdx < 5 ? "border-r" : ""} ${
                  isHoliday ? "bg-red-50/30" : today ? "bg-blue-50/30" : ""
                }`}
                style={{ gridColumn: colIdx + 2 }}
              >
                {positioned.map(({ group, column, totalColumns }) => {
                  const startMin = timeToMinutes(group.start_time);
                  const endMin = timeToMinutes(group.end_time);
                  const top = (startMin - gridStartMinute) * PX_PER_MINUTE;
                  const height = (endMin - startMin) * PX_PER_MINUTE;
                  const widthPercent = 100 / totalColumns;
                  const leftPercent = column * widthPercent;

                  const blockStyle = {
                    top,
                    height: Math.max(height, 20),
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 2px)`,
                  };
                  const blockTitle = `${group.code} — ${group.name}\n${formatTime(group.start_time)} – ${formatTime(group.end_time)}`;
                  const blockChildren = (
                    <>
                      <div className="text-[11px] font-semibold truncate leading-tight">
                        {group.code}
                      </div>
                      <div className="text-[10px] truncate leading-tight">
                        {formatTime(group.start_time)}–{formatTime(group.end_time)}
                      </div>
                      {height > 40 && (
                        <div className="text-[10px] truncate leading-tight text-blue-600">
                          {group.name}
                        </div>
                      )}
                    </>
                  );

                  return hideLinks ? (
                    <div
                      key={group.id}
                      className="absolute rounded-md bg-blue-100 border-l-2 border-l-blue-500 text-blue-800 overflow-hidden px-1.5 py-0.5"
                      style={blockStyle}
                      title={blockTitle}
                    >
                      {blockChildren}
                    </div>
                  ) : (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="absolute rounded-md bg-blue-100 border-l-2 border-l-blue-500 text-blue-800 hover:bg-blue-200 transition-colors overflow-hidden px-1.5 py-0.5"
                      style={blockStyle}
                      title={blockTitle}
                    >
                      {blockChildren}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Vertical column separators (hour label column border) */}
          <div className="absolute top-0 bottom-0 left-[60px] border-l pointer-events-none" />

          {/* Current time line */}
          {showTimeLine && (
            <div
              className="absolute left-[60px] right-0 pointer-events-none z-10 flex items-center"
              style={{ top: timeLineTop }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-px bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PositionedGroup {
  group: Group;
  column: number;
  totalColumns: number;
}

function computeOverlaps(dayGroups: Group[], _gridStartMinute: number): PositionedGroup[] {
  if (dayGroups.length === 0) return [];

  // Sort by start time
  const sorted = [...dayGroups].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );

  // Cluster overlapping groups
  const clusters: Group[][] = [];
  let current: Group[] = [sorted[0]];
  let clusterEnd = timeToMinutes(sorted[0].end_time);

  for (let i = 1; i < sorted.length; i++) {
    const start = timeToMinutes(sorted[i].start_time);
    if (start < clusterEnd) {
      current.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, timeToMinutes(sorted[i].end_time));
    } else {
      clusters.push(current);
      current = [sorted[i]];
      clusterEnd = timeToMinutes(sorted[i].end_time);
    }
  }
  clusters.push(current);

  const result: PositionedGroup[] = [];
  for (const cluster of clusters) {
    const totalColumns = cluster.length;
    cluster.forEach((group, col) => {
      result.push({ group, column: col, totalColumns });
    });
  }
  return result;
}
