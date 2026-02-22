import { Badge } from "@/components/ui/badge";
import { getLevelLabel, getLevelColor } from "@/lib/constants/levels";
import { getDayShort } from "@/lib/constants/days";

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getLevelColor(level)}`}>
      {getLevelLabel(level)}
    </span>
  );
}

export function DayBadge({ dayOfWeek }: { dayOfWeek: number }) {
  return (
    <Badge variant="outline" className="text-xs">
      {getDayShort(dayOfWeek)}
    </Badge>
  );
}

export function PaymentStatusDot({ hasActivePass }: { hasActivePass: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        hasActivePass ? "bg-green-500" : "bg-red-500"
      }`}
      title={hasActivePass ? "Aktywny karnet" : "Brak aktywnego karnetu"}
    />
  );
}
