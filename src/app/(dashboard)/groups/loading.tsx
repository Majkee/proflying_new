import { CardSkeleton } from "@/components/shared/skeletons";

export default function GroupsLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="animate-pulse rounded-md bg-muted h-8 w-24" />
        <div className="animate-pulse rounded-md bg-muted h-10 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
