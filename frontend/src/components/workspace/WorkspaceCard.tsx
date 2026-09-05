import { ChevronRight, Pencil, Trash2, Users } from "lucide-react";
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
      className="card-lift surface-sheen group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] p-5 hover:border-indigo-400/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300 ring-1 ring-inset ring-white/10 transition-transform duration-200 group-hover:scale-105">
          <Users className="size-5" />
        </span>
        <Menu
          items={[
            { label: "Rename", icon: <Pencil className="size-3.5" />, onSelect: onEdit },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>
      <h3 className="mt-3.5 truncate text-sm font-semibold text-white">{workspace.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
        {workspace.description || "No description yet."}
      </p>
      <ChevronRight className="pointer-events-none absolute bottom-4 right-4 size-4 -translate-x-1 text-indigo-400/0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-indigo-400/70" />
    </div>
  );
}
