import * as React from 'react';
import Modal from './Modal';
import { formatDistanceToNow } from 'date-fns';

interface LogOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAndLogOut: () => void;
  onLogOutAnyway: () => void;
  lastBackupDate: number | null;
}

const LogOutConfirmationModal: React.FC<LogOutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onExportAndLogOut,
  onLogOutAnyway,
  lastBackupDate,
}) => {
  if (!isOpen) return null;

  const lastBackupText = lastBackupDate
    ? `Your last backup was ${formatDistanceToNow(new Date(lastBackupDate), { addSuffix: true })}.`
    : 'You have not created a backup yet.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Are you sure you want to log out?">
      <div className="space-y-6">
        <p className="text-on-surface-variant body-large">
          "Logging out" will clear all your projects, categories, and settings from this device. This action cannot be undone.
        </p>
        <div className="bg-surface-container p-3 rounded-md text-center">
            <p className="text-on-surface-variant body-medium">{lastBackupText}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-outline hover:bg-outline/20 text-on-surface py-2 px-4 rounded-sm transition-colors order-last sm:order-first label-large"
          >
            Cancel
          </button>
           <button
            type="button"
            onClick={onExportAndLogOut}
            className="bg-primary/20 border border-primary/30 text-primary py-2 px-4 rounded-sm transition-colors hover:bg-primary/30 label-large"
          >
            Export First & Log Out
          </button>
          <button
            type="button"
            onClick={onLogOutAnyway}
            className="bg-error hover:brightness-90 text-on-primary py-2 px-4 rounded-sm transition-colors label-large"
          >
            Log Out Anyway
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogOutConfirmationModal;