import * as React from 'react';
import { Card as CardType } from '../../types';
import { TrashIcon, SparklesIcon, EditIcon } from '../ui/Icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardProps {
  card: CardType;
  onDelete: (cardId: string) => void;
  onOpenAiModal: (card: CardType) => void;
  onOpenEditModal: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, onDelete, onOpenAiModal, onOpenEditModal }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Wait for the animation to complete before removing the card from the state
    setTimeout(() => {
      onDelete(card.id);
    }, 300); // This duration must match the transition duration in the className
  };

  const baseClasses = "bg-surface rounded-md shadow-1 hover:shadow-2 group focus:outline-none focus:ring-2 focus:ring-primary border border-outline/20";
  const stateClasses = isDeleting
    ? "h-0 opacity-0 p-0 mb-0 overflow-hidden"
    : `p-3 mb-3 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${baseClasses} ${stateClasses} transition-all duration-300 ease-in-out`}
      tabIndex={0}
      role="button"
      aria-label={`Edit card: ${card.title}`}
      onKeyDown={(e) => { if (!isDeleting && (e.key === 'Enter' || e.key === ' ')) onOpenEditModal(card); }}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-on-surface break-words pr-2 title-medium">{card.title}</h4>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <button onClick={() => onOpenEditModal(card)} aria-label="Edit card" className="p-1 text-on-surface-variant hover:text-primary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onOpenAiModal(card)} aria-label="Enhance with AI" className="p-1 text-on-surface-variant hover:text-primary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
            <SparklesIcon className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} aria-label="Delete card" className="p-1 text-on-surface-variant hover:text-error rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {card.description && <p className="text-on-surface-variant mt-2 break-words whitespace-pre-wrap body-medium">{card.description}</p>}
    </div>
  );
};

export default Card;