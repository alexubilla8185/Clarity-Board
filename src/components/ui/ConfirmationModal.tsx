import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  confirmButtonClass,
}) => {
  if (!isOpen) return null;

  const defaultButtonClass =
    'bg-error hover:bg-red-700 dark:hover:bg-error/80 text-on-primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p
          className="text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-outline hover:bg-outline/20 text-on-surface font-medium py-2 px-4 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${
              confirmButtonClass || defaultButtonClass
            } font-bold py-2 px-4 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-surface`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
