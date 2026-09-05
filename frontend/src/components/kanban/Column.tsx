import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskColumn } from "../../types";
import { cn } from "../../lib/cn";
import { taskStats } from "../../lib/taskStats";
import { Menu } from "../ui/Menu";
import { ProgressBar } from "../ui/ProgressBar";
import { InlineAddForm } from "./InlineAddForm";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: TaskColumn;
  tasks: Task[];
  index: number;
  onRename: () => void;
  onDelete: () => void;
  onAddTask: (title: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function Column({ column, tasks, index, onRename, onDelete, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
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
    animationDelay: `${Math.min(index, 6) * 45}ms`,
  };

  const taskIds = tasks.map((t) => `task-${t.id}`);
  const stats = taskStats(tasks);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "animate-fade-in-stagger elevation-1 flex h-full w-72 shrink-0 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)]/90 backdrop-blur-sm transition-opacity duration-150",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent px-3 pb-2 pt-3">
        <div
          {...attributes}
          {...listeners}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 active:cursor-grabbing"
        >
          <GripVertical className="size-4 shrink-0 text-slate-600" />
          <h3 className="truncate text-sm font-semibold text-slate-100">{column.title}</h3>
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-400 ring-1 ring-inset ring-white/5">
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

      {stats.total > 0 && <ProgressBar {...stats} className="rounded-none" trackClassName="rounded-none" />}

      <div
        ref={setDroppableRef}
        className={cn(
          "flex min-h-[3rem] flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 transition-all duration-200",
          isOver && "bg-indigo-500/5 shadow-[inset_0_0_0_1.5px_rgba(129,140,248,0.4)]",
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, taskIndex) => (
            <TaskCard
              key={task.id}
              task={task}
              index={taskIndex}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        <InlineAddForm label="Add task" placeholder="Task title" onSubmit={onAddTask} />
      </div>
    </div>
  );
}
