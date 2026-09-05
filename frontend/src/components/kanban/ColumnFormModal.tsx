import { Columns3 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface ColumnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  initialTitle?: string;
}

export function ColumnFormModal({ isOpen, onClose, onSubmit, initialTitle }: ColumnFormModalProps) {
  // The parent remounts this component (via a changing `key`) each time it opens,
  // so reading `initialTitle` here at mount time is enough to reset the form.
  const [value, setValue] = useState(initialTitle ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Give the column a name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(value);
      onClose();
    } catch {
      setError("Couldn't save the column. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename column"
      size="sm"
      icon={<Columns3 className="size-4.5 text-indigo-300" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Column title" htmlFor="column-title">
          <Input
            id="column-title"
            autoFocus
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="In progress"
          />
        </Field>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
