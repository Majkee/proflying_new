export const LEVELS = [
  { value: "kids", label: "Kids", color: "bg-blue-100 text-blue-700" },
  { value: "teens", label: "Teens", color: "bg-cyan-100 text-cyan-700" },
  { value: "zero", label: "Zero", color: "bg-green-100 text-green-700" },
  { value: "podstawa", label: "Podstawa", color: "bg-yellow-100 text-yellow-700" },
  { value: "podstawa_plus", label: "Podstawa+", color: "bg-orange-100 text-orange-700" },
  { value: "sredni", label: "Sredni", color: "bg-red-100 text-red-700" },
  { value: "exotic", label: "Exotic", color: "bg-pink-100 text-pink-700" },
  { value: "priv", label: "Prywatne", color: "bg-purple-100 text-purple-700" },
] as const;

export type Level = (typeof LEVELS)[number]["value"];

export function getLevelLabel(value: string): string {
  return LEVELS.find((l) => l.value === value)?.label ?? value;
}

export function getLevelColor(value: string): string {
  return LEVELS.find((l) => l.value === value)?.color ?? "bg-gray-100 text-gray-700";
}
