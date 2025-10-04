import * as React from 'react';
import Modal from '../ui/Modal';

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
          <label htmlFor="item-name" className="block mb-1 text-on-surface-variant label-large">{label}</label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-sm bg-surface-container text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary body-large"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-surface-container hover:bg-outline/20 text-on-surface py-2 px-4 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface label-large"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-primary hover:bg-primary/90 text-on-primary py-2 px-4 rounded-sm transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface label-large"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;