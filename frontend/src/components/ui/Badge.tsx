import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { Priority, TaskStatus } from "../../types";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        className,
      )}
    >
      {children}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  LOW: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  MEDIUM: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  HIGH: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  URGENT: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={priorityStyles[priority]}>{priorityLabels[priority]}</Badge>;
}

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  DONE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>;
}
