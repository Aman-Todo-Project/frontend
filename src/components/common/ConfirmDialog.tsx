import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy} data-autofocus>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-red-600">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <p className="pt-2 text-sm leading-6 text-ink-500">{message}</p>
      </div>
    </Modal>
  );
}
