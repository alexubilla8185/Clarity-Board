import * as React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, CloseIcon } from './Icons';
import { ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const TOAST_CONFIG = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6" />,
    style: 'bg-green-600 dark:bg-green-500',
  },
  error: {
    icon: <ExclamationCircleIcon className="w-6 h-6" />,
    style: 'bg-red-600 dark:bg-red-500',
  },
  info: {
    icon: <InformationCircleIcon className="w-6 h-6" />,
    style: 'bg-primary',
  },
};

const TOAST_DURATION = 4000;

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Set timers to animate out and then remove from DOM
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, TOAST_DURATION);

    const removeTimer = setTimeout(() => {
        onDismiss();
    }, TOAST_DURATION + 300); // 300ms for fade-out animation

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  const config = TOAST_CONFIG[type];

  return (
    <div
      role="status"
      className={`relative flex items-center gap-4 w-full max-w-sm p-4 rounded-lg shadow-3 text-on-primary ${config.style} transition-all duration-300 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <p className="font-medium flex-grow">{message}</p>
      <button onClick={onDismiss} aria-label="Dismiss" className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;