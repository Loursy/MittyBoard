import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(79,70,229,0.5)] ring-1 ring-inset ring-white/10 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_8px_20px_-4px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-[var(--color-surface-3)] text-slate-100 border border-[var(--color-border)] shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-[var(--color-surface-2)] hover:border-white/20 disabled:opacity-50",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50",
  danger:
    "bg-rose-600/90 text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(225,29,72,0.45)] ring-1 ring-inset ring-white/10 hover:bg-rose-500 disabled:opacity-50 disabled:shadow-none",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  icon: "h-9 w-9 justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "focus-ring inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
