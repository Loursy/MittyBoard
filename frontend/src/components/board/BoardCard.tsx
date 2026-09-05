import { LayoutGrid, Pencil, Trash2 } from "lucide-react";
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
      className="group flex cursor-pointer flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5 transition-all hover:border-indigo-400/40 hover:bg-[var(--color-surface-2)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 text-fuchsia-300">
          <LayoutGrid className="size-5" />
        </span>
        <Menu
          items={[
            { label: "Rename", icon: <Pencil className="size-3.5" />, onSelect: onEdit },
            { label: "Delete", icon: <Trash2 className="size-3.5" />, onSelect: onDelete, danger: true },
          ]}
        />
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-white">{board.title}</h3>
      <p className="mt-1 text-xs text-slate-500">
        Created {new Date(board.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
