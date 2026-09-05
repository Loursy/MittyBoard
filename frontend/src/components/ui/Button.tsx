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
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-950/50 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50",
  secondary:
    "bg-[var(--color-surface-3)] text-slate-100 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] disabled:opacity-50",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50",
  danger: "bg-rose-600/90 text-white hover:bg-rose-500 disabled:opacity-50",
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
          "focus-ring inline-flex items-center rounded-lg font-medium transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed",
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
