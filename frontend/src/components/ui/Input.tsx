import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "focus-ring h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus-visible:border-indigo-400/70",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
