import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-indigo-400", className)} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
