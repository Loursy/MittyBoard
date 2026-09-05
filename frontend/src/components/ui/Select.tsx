import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "focus-ring h-10 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-3 pr-9 text-sm text-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-150 hover:border-white/20 focus-visible:border-indigo-400/70",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      </div>
    );
  },
);
Select.displayName = "Select";
