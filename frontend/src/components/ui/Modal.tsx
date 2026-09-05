import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function Modal({ isOpen, onClose, title, description, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "glass-panel animate-pop-in relative w-full rounded-2xl border border-[var(--color-border)] p-6 shadow-2xl shadow-black/40",
          sizeClasses[size],
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-white">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-slate-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="focus-ring -m-1 rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
