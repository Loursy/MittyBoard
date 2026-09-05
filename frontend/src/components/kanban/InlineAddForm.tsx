import { Plus } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "../../lib/cn";
import { apiErrorMessage } from "../../lib/api";

interface InlineAddFormProps {
  label: string;
  placeholder: string;
  onSubmit: (value: string) => Promise<void>;
  className?: string;
  buttonClassName?: string;
}

export function InlineAddForm({ label, placeholder, onSubmit, className, buttonClassName }: InlineAddFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setValue("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value.trim());
      setValue("");
      inputRef.current?.focus();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't save that. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "focus-ring flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white",
          buttonClassName,
        )}
      >
        <Plus className="size-4" />
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        onBlur={() => {
          if (!value.trim()) close();
        }}
        placeholder={placeholder}
        className="focus-ring h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 text-sm text-slate-100 placeholder:text-slate-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={close}
          className="focus-ring rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
