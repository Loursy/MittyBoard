import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)]">
        <Compass className="size-7 text-indigo-400" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-white">Page not found</h1>
        <p className="mt-1 text-sm text-slate-400">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/">
        <Button variant="primary">Back to workspaces</Button>
      </Link>
    </div>
  );
}
