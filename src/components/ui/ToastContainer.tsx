import React from 'react';
import { ToastMessage } from '../../contexts/ToastContext';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 flex flex-col items-center gap-2 p-4"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
