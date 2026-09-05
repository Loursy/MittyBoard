import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
      <div
        className="animate-glow-pulse pointer-events-none absolute size-64 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden
      />
      <span className="animate-float-soft relative flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] ring-1 ring-inset ring-white/10">
        <Compass className="size-7 text-indigo-400" />
      </span>
      <div className="relative">
        <h1 className="text-lg font-semibold text-white">Page not found</h1>
        <p className="mt-1 text-sm text-slate-400">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/" className="relative">
        <Button variant="primary">Back to workspaces</Button>
      </Link>
    </div>
  );
}
