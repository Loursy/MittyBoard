import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "focus-ring w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus-visible:border-indigo-400/70",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
