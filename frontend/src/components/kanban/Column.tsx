import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskColumn } from "../../types";
import { cn } from "../../lib/cn";
import { Menu } from "../ui/Menu";
import { InlineAddForm } from "./InlineAddForm";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: TaskColumn;
  tasks: Task[];
  onRename: () => void;
  onDelete: () => void;
  onAddTask: (title: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function Column({ column, tasks, onRename, onDelete, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-drop-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = tasks.map((t) => `task-${t.id}`);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)]/80",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
        <div
          {...attributes}
          {...listeners}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 active:cursor-grabbing"
        >
          <GripVertical className="size-4 shrink-0 text-slate-600" />
          <h3 className="truncate text-sm font-semibold text-slate-100">{column.title}</h3>
          <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
            {tasks.length}
          </span>
        </div>
        <Menu
          items={[
            { label: "Rename", icon: <Pencil className="size-3.5" />, onSelect: onRename },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>

      <div
        ref={setDroppableRef}
        className={cn(
          "flex min-h-[3rem] flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 transition-colors",
          isOver && "bg-indigo-500/5",
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task)} />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        <InlineAddForm label="Add task" placeholder="Task title" onSubmit={onAddTask} />
      </div>
    </div>
  );
}
