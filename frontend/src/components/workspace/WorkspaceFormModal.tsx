import { Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";

interface WorkspaceFormValues {
  name: string;
  description: string;
}

interface WorkspaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: WorkspaceFormValues) => Promise<void>;
  initialValues?: WorkspaceFormValues;
  title: string;
  submitLabel: string;
}

const emptyValues: WorkspaceFormValues = { name: "", description: "" };

export function WorkspaceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
  submitLabel,
}: WorkspaceFormModalProps) {
  // The parent remounts this component (via a changing `key`) each time it opens,
  // so reading `initialValues` here at mount time is enough to reset the form.
  const [values, setValues] = useState<WorkspaceFormValues>(initialValues ?? emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Give your workspace a name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch {
      setError("Couldn't save the workspace. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={<Users className="size-4.5 text-indigo-300" />}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" htmlFor="workspace-name">
          <Input
            id="workspace-name"
            autoFocus
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="Product team"
          />
        </Field>
        <Field label="Description" htmlFor="workspace-description">
          <Textarea
            id="workspace-description"
            rows={3}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="What's this workspace for?"
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
