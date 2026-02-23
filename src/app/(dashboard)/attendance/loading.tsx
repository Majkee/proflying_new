import { CardSkeleton } from "@/components/shared/skeletons";

export default function AttendanceLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="animate-pulse rounded-md bg-muted h-8 w-28 mb-2" />
          <div className="animate-pulse rounded-md bg-muted h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
