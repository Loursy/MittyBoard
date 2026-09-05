import { LayoutGrid, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useParams } from "react-router-dom";
import { boardsApi } from "../api/boards";
import { workspacesApi } from "../api/workspaces";
import { BoardCard } from "../components/board/BoardCard";
import { BoardFormModal } from "../components/board/BoardFormModal";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { CardGridSkeleton } from "../components/ui/Skeleton";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { apiErrorMessage } from "../lib/api";
import type { Board, Workspace } from "../types";

export function BoardsPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const { setCrumbs } = useBreadcrumbs();

  const [workspace, setWorkspace] = useState<Workspace | null | undefined>(undefined);
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    workspacesApi
      .list()
      .then((all) => setWorkspace(all.find((w) => w.id === id) ?? null))
      .catch(() => setWorkspace(null));

    boardsApi
      .listByWorkspace(id)
      .then(setBoards)
      .catch((err) => toast.error(apiErrorMessage(err, "Couldn't load boards.")));
  }, [id]);

  useEffect(() => {
    setCrumbs([
      { label: "Workspaces", to: "/" },
      { label: workspace === undefined ? "Loading…" : (workspace?.name ?? "Workspace") },
    ]);
    return () => setCrumbs([]);
  }, [setCrumbs, workspace]);

  if (!Number.isFinite(id)) return <Navigate to="/" replace />;

  const handleCreate = async (title: string) => {
    const created = await boardsApi.create(id, { title });
    setBoards((prev) => [...(prev ?? []), created]);
    toast.success("Board created");
  };

  const handleUpdate = async (title: string) => {
    if (!editingBoard) return;
    const updated = await boardsApi.update(editingBoard.id, { title });
    setBoards((prev) => prev?.map((b) => (b.id === updated.id ? updated : b)) ?? null);
    toast.success("Board updated");
  };

  const handleDelete = async () => {
    if (!deletingBoard) return;
    try {
      await boardsApi.remove(deletingBoard.id);
      setBoards((prev) => prev?.filter((b) => b.id !== deletingBoard.id) ?? null);
      toast.success("Board deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't delete board."));
    }
  };

  return (
    <div className="animate-rise-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {workspace === undefined ? "Loading…" : (workspace?.name ?? "Workspace")}
          </h1>
          {workspace?.description && <p className="mt-1 text-sm text-slate-400">{workspace.description}</p>}
        </div>
        <Button variant="primary" className="shrink-0" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          New board
        </Button>
      </div>

      {boards === null && <CardGridSkeleton count={6} />}

      {boards?.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create a board to start tracking tasks in columns."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              New board
            </Button>
          }
        />
      )}

      {boards && boards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={() => setEditingBoard(board)}
              onDelete={() => setDeletingBoard(board)}
            />
          ))}
        </div>
      )}

      <BoardFormModal
        key={`create-${isCreateOpen}`}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        title="New board"
        submitLabel="Create board"
      />

      <BoardFormModal
        key={`edit-${editingBoard?.id ?? "none"}`}
        isOpen={editingBoard !== null}
        onClose={() => setEditingBoard(null)}
        onSubmit={handleUpdate}
        initialTitle={editingBoard?.title}
        title="Rename board"
        submitLabel="Save changes"
      />

      <ConfirmDialog
        isOpen={deletingBoard !== null}
        onClose={() => setDeletingBoard(null)}
        onConfirm={handleDelete}
        title="Delete board?"
        description={`This deletes "${deletingBoard?.title}" and all of its columns and tasks. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
