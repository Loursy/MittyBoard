import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Pencil, Trash2 } from "lucide-react";
import type { Task } from "../../types";
import { cn } from "../../lib/cn";
import { PriorityBadge, StatusBadge } from "../ui/Badge";
import { Menu } from "../ui/Menu";
import { priorityAccentColor } from "../../lib/priorityColors";
import { relativeTime } from "../../lib/relativeTime";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${Math.min(index, 8) * 35}ms`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className={cn(
        "animate-fade-in-stagger group relative cursor-grab overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-3 pl-4 pr-3 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.4),0_4px_10px_-4px_rgba(0,0,0,0.35)] transition-all duration-200 ease-out active:cursor-grabbing",
        "hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_2px_4px_-2px_rgba(0,0,0,0.5),0_12px_24px_-8px_rgba(0,0,0,0.5)]",
        isDragging && "rotate-1 opacity-40 shadow-none",
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", task.priority === "URGENT" && "animate-urgent-pulse")}
        style={{ backgroundColor: priorityAccentColor[task.priority] }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-words text-sm font-medium leading-snug text-slate-100">{task.title}</p>
        <Menu
          className="shrink-0 opacity-0 group-hover:opacity-100"
          items={[
            { label: "Edit", icon: <Pencil className="size-3.5" />, onSelect: onEdit },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>

      {task.description && <p className="mt-1 line-clamp-2 break-words text-xs text-slate-400">{task.description}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <span className="ml-auto flex items-center gap-1 whitespace-nowrap text-[11px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
          <Clock className="size-3" />
          {relativeTime(task.createdAt)}
        </span>
      </div>
    </div>
  );
}
