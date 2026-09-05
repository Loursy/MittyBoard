import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
      <div
        className="animate-glow-pulse pointer-events-none absolute size-40 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden
      />
      <div className="animate-float-soft relative mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 ring-1 ring-inset ring-white/10">
        <Icon className="size-6 text-indigo-300" />
      </div>
      <h3 className="relative text-sm font-semibold text-white">{title}</h3>
      {description && <p className="relative mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}
