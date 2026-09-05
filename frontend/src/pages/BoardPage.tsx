import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, SortableContext } from "@dnd-kit/sortable";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useParams } from "react-router-dom";
import { boardsApi } from "../api/boards";
import { columnsApi } from "../api/columns";
import { tasksApi } from "../api/tasks";
import { Column } from "../components/kanban/Column";
import { ColumnFormModal } from "../components/kanban/ColumnFormModal";
import { InlineAddForm } from "../components/kanban/InlineAddForm";
import { type TaskFormValues, TaskFormModal } from "../components/kanban/TaskFormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { apiErrorMessage } from "../lib/api";
import type { Board, Task, TaskColumn, TaskRequest } from "../types";

type DragData =
  | { type: "task"; taskId: number; columnId: number }
  | { type: "column"; columnId: number };

export function BoardPage() {
  const { workspaceId, boardId } = useParams();
  const wsId = Number(workspaceId);
  const brdId = Number(boardId);

  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [columns, setColumns] = useState<TaskColumn[] | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [renamingColumn, setRenamingColumn] = useState<TaskColumn | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<TaskColumn | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!Number.isFinite(wsId) || !Number.isFinite(brdId)) return;

    boardsApi
      .listByWorkspace(wsId)
      .then((all) => setBoard(all.find((b) => b.id === brdId) ?? null))
      .catch(() => setBoard(null));

    (async () => {
      try {
        const cols = await columnsApi.listByBoard(brdId);
        const sortedCols = [...cols].sort((a, b) => a.position - b.position);
        setColumns(sortedCols);

        const taskLists = await Promise.all(sortedCols.map((c) => tasksApi.listByColumn(c.id)));
        const byColumn: Record<number, Task[]> = {};
        sortedCols.forEach((c, i) => {
          byColumn[c.id] = [...taskLists[i]].sort((a, b) => a.position - b.position);
        });
        setTasksByColumn(byColumn);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't load the board."));
        setColumns([]);
      }
    })();
  }, [wsId, brdId]);

  if (!Number.isFinite(wsId) || !Number.isFinite(brdId)) return <Navigate to="/" replace />;

  const handleAddColumn = async (title: string) => {
    const position = columns?.length ?? 0;
    const created = await columnsApi.create(brdId, { title, position, boardId: brdId });
    setColumns((prev) => [...(prev ?? []), created]);
    setTasksByColumn((prev) => ({ ...prev, [created.id]: [] }));
  };

  const handleRenameColumn = async (title: string) => {
    if (!renamingColumn) return;
    const updated = await columnsApi.update(renamingColumn.id, { title });
    setColumns((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null);
  };

  const handleDeleteColumn = async () => {
    if (!deletingColumn) return;
    try {
      await columnsApi.remove(deletingColumn.id);
      setColumns((prev) => prev?.filter((c) => c.id !== deletingColumn.id) ?? null);
      setTasksByColumn((prev) => {
        const next = { ...prev };
        delete next[deletingColumn.id];
        return next;
      });
      toast.success("Column deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't delete column."));
    }
  };

  const handleAddTask = async (column: TaskColumn, title: string) => {
    const position = tasksByColumn[column.id]?.length ?? 0;
    const created = await tasksApi.create(column.id, { title, position, priority: "MEDIUM", status: "TODO" });
    setTasksByColumn((prev) => ({ ...prev, [column.id]: [...(prev[column.id] ?? []), created] }));
  };

  const handleEditTask = async (values: TaskFormValues) => {
    if (!editingTask) return;
    const updated = await tasksApi.update(editingTask.id, values);
    setTasksByColumn((prev) => ({
      ...prev,
      [updated.columnId]: (prev[updated.columnId] ?? []).map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await tasksApi.remove(deletingTask.id);
      setTasksByColumn((prev) => ({
        ...prev,
        [deletingTask.columnId]: (prev[deletingTask.columnId] ?? []).filter((t) => t.id !== deletingTask.id),
      }));
      toast.success("Task deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't delete task."));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag((event.active.data.current as DragData) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;
    if (!activeData) return;

    if (activeData.type === "column") {
      if (overData?.type !== "column" || active.id === over.id) return;

      setColumns((prev) => {
        if (!prev) return prev;
        const oldIndex = prev.findIndex((c) => `column-${c.id}` === active.id);
        const newIndex = prev.findIndex((c) => `column-${c.id}` === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(prev, oldIndex, newIndex).map((c, idx) => ({ ...c, position: idx }));
        reordered.forEach((c) => {
          const original = prev.find((p) => p.id === c.id);
          if (original && original.position !== c.position) {
            columnsApi.update(c.id, { position: c.position }).catch(() => toast.error("Couldn't save column order."));
          }
        });
        return reordered;
      });
      return;
    }

    const taskId = activeData.taskId;
    const sourceColumnId = activeData.columnId;
    const destColumnId =
      overData?.type === "column" ? overData.columnId : overData?.type === "task" ? overData.columnId : undefined;
    if (destColumnId === undefined) return;

    setTasksByColumn((prev) => {
      const sourceList = [...(prev[sourceColumnId] ?? [])];
      const sourceIndex = sourceList.findIndex((t) => t.id === taskId);
      if (sourceIndex === -1) return prev;
      const [moved] = sourceList.splice(sourceIndex, 1);

      const destList = sourceColumnId === destColumnId ? sourceList : [...(prev[destColumnId] ?? [])];

      let destIndex = destList.length;
      if (overData?.type === "task") {
        const overIndex = destList.findIndex((t) => t.id === overData.taskId);
        if (overIndex !== -1) destIndex = overIndex;
      }

      destList.splice(destIndex, 0, { ...moved, columnId: destColumnId });

      const next = { ...prev };
      next[sourceColumnId] = sourceList.map((t, i) => ({ ...t, position: i }));
      next[destColumnId] = destList.map((t, i) => ({ ...t, position: i }));

      const original = prev;
      const touched = new Set([sourceColumnId, destColumnId]);
      touched.forEach((colId) => {
        next[colId].forEach((t) => {
          const originalTask = original[colId]?.find((o) => o.id === t.id);
          const positionChanged = originalTask?.position !== t.position;
          const movedHere = t.id === taskId && sourceColumnId !== destColumnId;
          if (positionChanged || movedHere) {
            const payload: TaskRequest = { position: t.position };
            if (movedHere) payload.columnId = destColumnId;
            tasksApi.update(t.id, payload).catch(() => toast.error("Couldn't save task position."));
          }
        });
      });

      return next;
    });
  };

  const activeTask =
    activeDrag?.type === "task" ? tasksByColumn[activeDrag.columnId]?.find((t) => t.id === activeDrag.taskId) : null;
  const activeColumn = activeDrag?.type === "column" ? columns?.find((c) => c.id === activeDrag.columnId) : null;

  return (
    <div className="flex h-full flex-col">
      <Link
        to={`/workspaces/${wsId}`}
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Boards
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-white">
        {board === undefined ? "Loading…" : (board?.title ?? "Board")}
      </h1>

      {columns === null && (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      )}

      {columns?.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No columns yet"
          description="Add your first column (e.g. To do, In progress, Done) to start tracking tasks."
        />
      )}

      {columns && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 items-start gap-4 overflow-x-auto pb-4">
            <SortableContext items={columns.map((c) => `column-${c.id}`)} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] ?? []}
                  onRename={() => setRenamingColumn(column)}
                  onDelete={() => setDeletingColumn(column)}
                  onAddTask={(title) => handleAddTask(column, title)}
                  onEditTask={setEditingTask}
                  onDeleteTask={setDeletingTask}
                />
              ))}
            </SortableContext>

            <div className="w-72 shrink-0 rounded-2xl border border-dashed border-[var(--color-border)] p-1">
              <InlineAddForm label="Add column" placeholder="Column title" onSubmit={handleAddColumn} />
            </div>
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-72 rounded-xl border border-indigo-400/50 bg-[var(--color-surface-2)] p-3 shadow-2xl shadow-black/40">
                <p className="text-sm font-medium text-slate-100">{activeTask.title}</p>
              </div>
            )}
            {activeColumn && (
              <div className="w-72 rounded-2xl border border-indigo-400/50 bg-[var(--color-surface-1)] p-3 shadow-2xl shadow-black/40">
                <p className="text-sm font-semibold text-slate-100">{activeColumn.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormModal
        key={`edit-task-${editingTask?.id ?? "none"}`}
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description ?? "",
                priority: editingTask.priority,
                status: editingTask.status,
              }
            : undefined
        }
        title="Edit task"
        submitLabel="Save changes"
      />

      <ColumnFormModal
        key={`rename-column-${renamingColumn?.id ?? "none"}`}
        isOpen={renamingColumn !== null}
        onClose={() => setRenamingColumn(null)}
        onSubmit={handleRenameColumn}
        initialTitle={renamingColumn?.title}
      />

      <ConfirmDialog
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete task?"
        description={`This permanently deletes "${deletingTask?.title}".`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={deletingColumn !== null}
        onClose={() => setDeletingColumn(null)}
        onConfirm={handleDeleteColumn}
        title="Delete column?"
        description={`This deletes "${deletingColumn?.title}" and all of its tasks. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
