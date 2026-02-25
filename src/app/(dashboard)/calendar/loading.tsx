import { CardSkeleton } from "@/components/shared/skeletons";

export default function CalendarLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="animate-pulse rounded-md bg-muted h-8 w-40" />
      </div>
      <div className="animate-pulse rounded-md bg-muted h-10 w-60 mb-4" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
