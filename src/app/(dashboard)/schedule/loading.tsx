import { CardSkeleton } from "@/components/shared/skeletons";

export default function ScheduleLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="animate-pulse rounded-md bg-muted h-8 w-40" />
      </div>
      <div className="hidden lg:grid lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="animate-pulse rounded-md bg-muted h-5 w-20 mx-auto mb-3" />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ))}
      </div>
      <div className="lg:hidden space-y-3">
        <div className="animate-pulse rounded-md bg-muted h-10 w-full" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
