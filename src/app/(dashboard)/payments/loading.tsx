import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/skeletons";

export default function PaymentsLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="animate-pulse rounded-md bg-muted h-8 w-28" />
        <div className="animate-pulse rounded-md bg-muted h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="animate-pulse rounded-md bg-muted h-6 w-40 mb-4" />
      <div className="rounded-lg border">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={4} />
        ))}
      </div>
    </div>
  );
}
