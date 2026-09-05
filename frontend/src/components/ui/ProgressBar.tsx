import { cn } from "../../lib/cn";

interface ProgressBarProps {
  done: number;
  inProgress: number;
  total: number;
  className?: string;
  trackClassName?: string;
}

/** Segmented done/in-progress bar over a task list — emerald + indigo match the status badge colors. */
export function ProgressBar({ done, inProgress, total, className, trackClassName }: ProgressBarProps) {
  const donePct = total > 0 ? (done / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", trackClassName, className)}>
      <div className="flex h-full">
        <div className="h-full bg-emerald-500 transition-[width] duration-300 ease-out" style={{ width: `${donePct}%` }} />
        <div
          className="h-full bg-indigo-500 transition-[width] duration-300 ease-out"
          style={{ width: `${inProgressPct}%` }}
        />
      </div>
    </div>
  );
}
