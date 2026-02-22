import { format, isToday, isYesterday, isTomorrow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: pl });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM", { locale: pl });
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Dzisiaj";
  if (isYesterday(d)) return "Wczoraj";
  if (isTomorrow(d)) return "Jutro";
  return formatDate(d);
}

export function getDayName(dayOfWeek: number): string {
  const days = [
    "Niedziela",
    "Poniedzialek",
    "Wtorek",
    "Sroda",
    "Czwartek",
    "Piatek",
    "Sobota",
  ];
  return days[dayOfWeek] ?? "";
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getCurrentDayOfWeek(): number {
  return new Date().getDay();
}

export function formatMonthYear(date: Date): string {
  return format(date, "LLLL yyyy", { locale: pl });
}
