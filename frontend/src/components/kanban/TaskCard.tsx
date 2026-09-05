import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "../../types";
import { cn } from "../../lib/cn";
import { PriorityBadge, StatusBadge } from "../ui/Badge";
import { Menu } from "../ui/Menu";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className={cn(
        "group cursor-grab rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 shadow-sm shadow-black/20 transition-colors active:cursor-grabbing hover:border-indigo-400/40",
        isDragging && "opacity-40",
      )}
    >
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
      </div>
    </div>
  );
}
