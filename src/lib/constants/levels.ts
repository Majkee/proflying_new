import type { GroupLevel } from "@/lib/types/database";

// Fallback data used when DB levels haven't loaded yet
const FALLBACK_LEVELS: Record<string, { label: string; color: string }> = {
  kids: { label: "Kids", color: "bg-blue-100 text-blue-700" },
  teens: { label: "Teens", color: "bg-cyan-100 text-cyan-700" },
  zero: { label: "Zero", color: "bg-green-100 text-green-700" },
  podstawa: { label: "Podstawa", color: "bg-yellow-100 text-yellow-700" },
  podstawa_plus: { label: "Podstawa+", color: "bg-orange-100 text-orange-700" },
  sredni: { label: "Sredni", color: "bg-red-100 text-red-700" },
  exotic: { label: "Exotic", color: "bg-pink-100 text-pink-700" },
  priv: { label: "Prywatne", color: "bg-purple-100 text-purple-700" },
};

export function getLevelLabel(value: string, levels?: GroupLevel[]): string {
  if (levels) {
    const found = levels.find((l) => l.value === value);
    if (found) return found.label;
  }
  return FALLBACK_LEVELS[value]?.label ?? value;
}

export function getLevelColor(value: string, levels?: GroupLevel[]): string {
  if (levels) {
    const found = levels.find((l) => l.value === value);
    if (found) return found.color;
  }
  return FALLBACK_LEVELS[value]?.color ?? "bg-gray-100 text-gray-700";
}

export const LEVEL_COLORS = [
  { value: "bg-blue-100 text-blue-700", label: "Niebieski" },
  { value: "bg-cyan-100 text-cyan-700", label: "Cyjan" },
  { value: "bg-green-100 text-green-700", label: "Zielony" },
  { value: "bg-yellow-100 text-yellow-700", label: "Zolty" },
  { value: "bg-orange-100 text-orange-700", label: "Pomaranczowy" },
  { value: "bg-red-100 text-red-700", label: "Czerwony" },
  { value: "bg-pink-100 text-pink-700", label: "Rozowy" },
  { value: "bg-purple-100 text-purple-700", label: "Fioletowy" },
  { value: "bg-indigo-100 text-indigo-700", label: "Indygo" },
  { value: "bg-teal-100 text-teal-700", label: "Morski" },
  { value: "bg-emerald-100 text-emerald-700", label: "Szmaragdowy" },
  { value: "bg-amber-100 text-amber-700", label: "Bursztynowy" },
  { value: "bg-gray-100 text-gray-700", label: "Szary" },
];
