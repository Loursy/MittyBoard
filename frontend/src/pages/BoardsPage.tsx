import { ArrowLeft, LayoutGrid, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useParams } from "react-router-dom";
import { boardsApi } from "../api/boards";
import { workspacesApi } from "../api/workspaces";
import { BoardCard } from "../components/board/BoardCard";
import { BoardFormModal } from "../components/board/BoardFormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { apiErrorMessage } from "../lib/api";
import type { Board, Workspace } from "../types";

export function BoardsPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);

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
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="size-4" />
        Workspaces
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {workspace === undefined ? "Loading…" : (workspace?.name ?? "Workspace")}
          </h1>
          {workspace?.description && <p className="mt-1 text-sm text-slate-400">{workspace.description}</p>}
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-medium text-white shadow-sm shadow-indigo-950/50 hover:from-indigo-400 hover:to-indigo-500"
        >
          <Plus className="size-4" />
          New board
        </button>
      </div>

      {boards === null && (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      )}

      {boards?.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create a board to start tracking tasks in columns."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 px-3.5 text-sm font-medium text-white hover:from-indigo-400 hover:to-indigo-500"
            >
              <Plus className="size-4" />
              New board
            </button>
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
