import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "focus-ring h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] placeholder:text-slate-500 transition-all duration-150 hover:border-white/20 focus-visible:border-indigo-400/70",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
