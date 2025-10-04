import * as React from 'react';
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
    'bg-error hover:brightness-90 text-on-error';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p
          className="text-on-surface-variant body-large"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-full transition-all border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 label-large"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${
              confirmButtonClass || defaultButtonClass
            } h-10 px-6 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-surface focus:ring-on-error/50 label-large`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
