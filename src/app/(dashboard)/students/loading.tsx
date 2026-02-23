import { TableRowSkeleton } from "@/components/shared/skeletons";

export default function StudentsLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="animate-pulse rounded-md bg-muted h-8 w-32" />
        <div className="animate-pulse rounded-md bg-muted h-10 w-24" />
      </div>
      <div className="animate-pulse rounded-md bg-muted h-10 w-full mb-4" />
      <div className="rounded-lg border">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={3} />
        ))}
      </div>
    </div>
  );
}
