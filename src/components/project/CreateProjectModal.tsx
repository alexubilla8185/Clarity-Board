import * as React from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title: string;
  label: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, title, label }) => {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            id="item-name"
            label={label}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-container"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-full transition-all border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 label-large"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="h-10 px-6 rounded-full transition-all bg-primary text-on-primary hover:shadow-1 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 label-large"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
