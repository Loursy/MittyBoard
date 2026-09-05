import { MoreHorizontal } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

export function Menu({ items, className }: { items: MenuItem[]; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        className={cn(
          "focus-ring flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white",
          isOpen && "bg-white/10 text-white",
        )}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {isOpen && (
        <div
          className="animate-pop-in absolute right-0 z-20 mt-1 w-40 origin-top-right overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1 shadow-xl shadow-black/40 ring-1 ring-inset ring-white/[0.04]"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-white/5",
                item.danger ? "text-rose-400" : "text-slate-200",
                item.danger && i > 0 && "mt-1 border-t border-[var(--color-border)] pt-2",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
