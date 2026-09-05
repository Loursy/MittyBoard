import { ListChecks } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from "../../types";

export interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  initialValues?: TaskFormValues;
  title: string;
  submitLabel: string;
}

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
};

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export function TaskFormModal({ isOpen, onClose, onSubmit, initialValues, title, submitLabel }: TaskFormModalProps) {
  // The parent remounts this component (via a changing `key`) each time it opens,
  // so reading `initialValues` here at mount time is enough to reset the form.
  const [values, setValues] = useState<TaskFormValues>(initialValues ?? defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Give the task a title.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch {
      setError("Couldn't save the task. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg" icon={<ListChecks className="size-4.5 text-indigo-300" />}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title" htmlFor="task-title">
          <Input
            id="task-title"
            autoFocus
            required
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="Design the onboarding flow"
          />
        </Field>

        <Field label="Description" htmlFor="task-description">
          <Textarea
            id="task-description"
            rows={4}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Add more detail…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={values.priority}
              onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value as Priority }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status" htmlFor="task-status">
            <Select
              id="task-status"
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as TaskStatus }))}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

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
