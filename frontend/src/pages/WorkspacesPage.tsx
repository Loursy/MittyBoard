import { Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workspacesApi } from "../api/workspaces";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { CardGridSkeleton } from "../components/ui/Skeleton";
import { WorkspaceCard } from "../components/workspace/WorkspaceCard";
import { WorkspaceFormModal } from "../components/workspace/WorkspaceFormModal";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { apiErrorMessage } from "../lib/api";
import type { Workspace } from "../types";

export function WorkspacesPage() {
  const { setCrumbs } = useBreadcrumbs();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    setCrumbs([{ label: "Workspaces" }]);
    return () => setCrumbs([]);
  }, [setCrumbs]);

  useEffect(() => {
    workspacesApi
      .list()
      .then(setWorkspaces)
      .catch((err) => toast.error(apiErrorMessage(err, "Couldn't load workspaces.")));
  }, []);

  const handleCreate = async (values: { name: string; description: string }) => {
    const created = await workspacesApi.create({ name: values.name, description: values.description });
    setWorkspaces((prev) => [...(prev ?? []), created]);
    toast.success("Workspace created");
  };

  const handleUpdate = async (values: { name: string; description: string }) => {
    if (!editingWorkspace) return;
    const updated = await workspacesApi.update(editingWorkspace.id, {
      name: values.name,
      description: values.description,
    });
    setWorkspaces((prev) => prev?.map((w) => (w.id === updated.id ? updated : w)) ?? null);
    toast.success("Workspace updated");
  };

  const handleDelete = async () => {
    if (!deletingWorkspace) return;
    try {
      await workspacesApi.remove(deletingWorkspace.id);
      setWorkspaces((prev) => prev?.filter((w) => w.id !== deletingWorkspace.id) ?? null);
      toast.success("Workspace deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't delete workspace."));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Workspaces</h1>
          <p className="mt-1 text-sm text-slate-400">Pick a workspace to see its boards.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          New workspace
        </Button>
      </div>

      {workspaces === null && <CardGridSkeleton count={6} />}

      {workspaces?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No workspaces yet"
          description="Create a workspace to start organizing boards for your team or project."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              New workspace
            </Button>
          }
        />
      )}

      {workspaces && workspaces.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace, i) => (
            <div key={workspace.id} className="animate-rise-in" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <WorkspaceCard
                workspace={workspace}
                onEdit={() => setEditingWorkspace(workspace)}
                onDelete={() => setDeletingWorkspace(workspace)}
              />
            </div>
          ))}
        </div>
      )}

      <WorkspaceFormModal
        key={`create-${isCreateOpen}`}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        title="New workspace"
        submitLabel="Create workspace"
      />

      <WorkspaceFormModal
        key={`edit-${editingWorkspace?.id ?? "none"}`}
        isOpen={editingWorkspace !== null}
        onClose={() => setEditingWorkspace(null)}
        onSubmit={handleUpdate}
        initialValues={
          editingWorkspace
            ? { name: editingWorkspace.name, description: editingWorkspace.description ?? "" }
            : undefined
        }
        title="Rename workspace"
        submitLabel="Save changes"
      />

      <ConfirmDialog
        isOpen={deletingWorkspace !== null}
        onClose={() => setDeletingWorkspace(null)}
        onConfirm={handleDelete}
        title="Delete workspace?"
        description={`This deletes "${deletingWorkspace?.name}" and everything inside it. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
