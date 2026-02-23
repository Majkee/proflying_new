import { StatCardSkeleton, CardSkeleton } from "@/components/shared/skeletons";

export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="animate-pulse rounded-md bg-muted h-8 w-24 mb-2" />
          <div className="animate-pulse rounded-md bg-muted h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="animate-pulse rounded-md bg-muted h-6 w-40 mb-4" />
      <CardSkeleton />
    </div>
  );
}
