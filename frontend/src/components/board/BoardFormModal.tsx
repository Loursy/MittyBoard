import { LayoutGrid } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface BoardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  initialTitle?: string;
  title: string;
  submitLabel: string;
}

export function BoardFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialTitle,
  title,
  submitLabel,
}: BoardFormModalProps) {
  // The parent remounts this component (via a changing `key`) each time it opens,
  // so reading `initialTitle` here at mount time is enough to reset the form.
  const [value, setValue] = useState(initialTitle ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Give your board a name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(value);
      onClose();
    } catch {
      setError("Couldn't save the board. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      icon={<LayoutGrid className="size-4.5 text-indigo-300" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Board title" htmlFor="board-title">
          <Input
            id="board-title"
            autoFocus
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Sprint 12"
          />
        </Field>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
