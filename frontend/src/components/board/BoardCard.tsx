import { ChevronRight, LayoutGrid, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Board } from "../../types";
import { Menu } from "../ui/Menu";

interface BoardCardProps {
  board: Board;
  onEdit: () => void;
  onDelete: () => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/workspaces/${board.workspaceId}/boards/${board.id}`)}
      className="card-lift surface-sheen group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] p-5 hover:border-fuchsia-400/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 text-fuchsia-300 ring-1 ring-inset ring-white/10 transition-transform duration-200 group-hover:scale-105">
          <LayoutGrid className="size-5" />
        </span>
        <Menu
          items={[
            { label: "Rename", icon: <Pencil className="size-3.5" />, onSelect: onEdit },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>
      <h3 className="mt-3.5 truncate text-sm font-semibold text-white">{board.title}</h3>
      <p className="mt-1 text-xs text-slate-500">
        Created {new Date(board.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <ChevronRight className="pointer-events-none absolute bottom-4 right-4 size-4 -translate-x-1 text-fuchsia-400/0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-fuchsia-400/70" />
    </div>
  );
}
