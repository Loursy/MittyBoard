import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2.5 h-3.5 w-full" />
      <Skeleton className="mt-1.5 h-3.5 w-4/5" />
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ColumnSkeleton() {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)]/80 p-3">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-3/4 rounded-xl" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex flex-1 items-start gap-4 overflow-x-hidden pb-4">
      <ColumnSkeleton />
      <ColumnSkeleton />
      <ColumnSkeleton />
    </div>
  );
}
