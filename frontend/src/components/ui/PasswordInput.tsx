import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { type InputHTMLAttributes, type KeyboardEvent, forwardRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Input } from "./Input";

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onKeyDown, onKeyUp, onBlur, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);

    const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
      setIsCapsLockOn(e.getModifierState?.("CapsLock") ?? false);
    };

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            type={isVisible ? "text" : "password"}
            className={cn("pr-10", className)}
            onKeyDown={(e) => {
              trackCapsLock(e);
              onKeyDown?.(e);
            }}
            onKeyUp={(e) => {
              trackCapsLock(e);
              onKeyUp?.(e);
            }}
            onBlur={(e) => {
              setIsCapsLockOn(false);
              onBlur?.(e);
            }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            className="focus-ring absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:text-slate-300"
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
          >
            {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
        </div>
        {isCapsLockOn && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-400">
            <TriangleAlert className="size-3.5" />
            Caps Lock is on
          </p>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
