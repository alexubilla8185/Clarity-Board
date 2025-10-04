import * as React from 'react';
import Modal from '../ui/Modal';
import { SparklesIcon } from '../ui/Icons';
import { useToast } from '../../contexts/ToastContext';
import Textarea from '../ui/Textarea';

interface SmartSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

const SmartSplitModal: React.FC<SmartSplitModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) {
      showToast('Please enter some text to analyze.', 'error');
      return;
    }
    setIsLoading(true);
    await onSubmit(text);
    // If onSubmit succeeds, App.tsx closes the modal.
    // If it fails, App.tsx shows a toast, and we stop the loading indicator here.
    setIsLoading(false);
  };

  const handleClose = () => {
    if (isLoading) return;
    setText('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Smart Split">
      <div className="space-y-4">
        <p className="body-medium text-on-surface-variant">
          Paste in your notes, a block of text, or a list of items. The AI will analyze it and create a structured project board for you.
        </p>
        <Textarea
          label="e.g., Meeting notes from today's sync..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-10 px-6 rounded-full transition-all border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 label-large"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-6 rounded-full transition-all bg-primary text-on-primary hover:shadow-1 flex items-center justify-center min-w-[140px] focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 label-large"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
            ) : (
                <>
                 <SparklesIcon className="w-5 h-5 mr-2" />
                 Split Text
                </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SmartSplitModal;
