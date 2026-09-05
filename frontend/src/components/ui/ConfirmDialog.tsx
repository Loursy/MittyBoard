import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={handleConfirm} isLoading={isSubmitting}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
