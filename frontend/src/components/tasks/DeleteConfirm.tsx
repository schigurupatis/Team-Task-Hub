import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Task } from '@/types/task.types';

interface DeleteConfirmProps {
  task: Task | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ task, onConfirm, onCancel, loading }) => {
  const [busy, setBusy] = React.useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };

  return (
    <Modal isOpen={!!task} onClose={onCancel} title="Delete Task" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">"{task?.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={busy || loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={busy || loading}>
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
};
