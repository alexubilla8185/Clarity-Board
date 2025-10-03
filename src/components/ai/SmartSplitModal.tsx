import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { SparklesIcon } from '../ui/Icons';
import { useToast } from '../../contexts/ToastContext';

interface SmartSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

const SmartSplitModal: React.FC<SmartSplitModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        <p className="text-sm text-on-surface-variant">
          Paste in your notes, a block of text, or a list of items. The AI will analyze it and create a structured project board for you.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full p-2 rounded-sm bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="e.g., Meeting notes from today's sync..."
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="bg-surface-container hover:bg-outline/20 text-on-surface font-medium py-2 px-4 rounded-sm transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-sm transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
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