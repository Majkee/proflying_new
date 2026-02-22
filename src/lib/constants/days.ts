export const DAYS_OF_WEEK = [
  { value: 1, label: "Poniedzialek", short: "Pon" },
  { value: 2, label: "Wtorek", short: "Wt" },
  { value: 3, label: "Sroda", short: "Sr" },
  { value: 4, label: "Czwartek", short: "Czw" },
  { value: 5, label: "Piatek", short: "Pt" },
  { value: 6, label: "Sobota", short: "Sob" },
  { value: 0, label: "Niedziela", short: "Nd" },
] as const;

export function getDayLabel(value: number): string {
  return DAYS_OF_WEEK.find((d) => d.value === value)?.label ?? "";
}

export function getDayShort(value: number): string {
  return DAYS_OF_WEEK.find((d) => d.value === value)?.short ?? "";
}
