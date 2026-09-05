import { Pencil, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Workspace } from "../../types";
import { Menu } from "../ui/Menu";

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkspaceCard({ workspace, onEdit, onDelete }: WorkspaceCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
      className="group flex cursor-pointer flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5 transition-all hover:border-indigo-400/40 hover:bg-[var(--color-surface-2)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300">
          <Users className="size-5" />
        </span>
        <Menu
          items={[
            { label: "Rename", icon: <Pencil className="size-3.5" />, onSelect: onEdit },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-white">{workspace.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
        {workspace.description || "No description yet."}
      </p>
    </div>
  );
}
