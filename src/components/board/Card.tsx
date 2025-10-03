import React, { useState } from 'react';
import { Card as CardType } from '../../types';
import { TrashIcon, SparklesIcon, EditIcon } from '../ui/Icons';

interface CardProps {
  card: CardType;
  columnIndex: number;
  cardIndex: number;
  onDelete: (columnIndex: number, cardIndex: number) => void;
  onOpenAiModal: (card: CardType) => void;
  onOpenEditModal: (card: CardType, columnIndex: number, cardIndex: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number, cardIndex: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetColumnIndex: number, targetCardIndex: number) => void;
}

const Card: React.FC<CardProps> = ({ card, columnIndex, cardIndex, onDelete, onOpenAiModal, onOpenEditModal, onDragStart, onDragEnter }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Wait for the animation to complete before removing the card from the state
    setTimeout(() => {
      onDelete(columnIndex, cardIndex);
    }, 300); // This duration must match the transition duration in the className
  };

  const baseClasses = "bg-surface rounded-md shadow-1 hover:shadow-2 group focus:outline-none focus:ring-2 focus:ring-primary border border-outline/20";
  const transitionClasses = "transition-all duration-300 ease-in-out";
  const stateClasses = isDeleting
    ? "h-0 opacity-0 p-0 mb-0 overflow-hidden"
    : "p-3 mb-3 cursor-grab active:cursor-grabbing";

  return (
    <div
      draggable={!isDeleting}
      onDragStart={(e) => !isDeleting && onDragStart(e, columnIndex, cardIndex)}
      onDragEnter={(e) => onDragEnter(e, columnIndex, cardIndex)}
      className={`${baseClasses} ${transitionClasses} ${stateClasses}`}
      tabIndex={0}
      role="button"
      aria-label={`Edit card: ${card.title}`}
      onKeyDown={(e) => { if (!isDeleting && (e.key === 'Enter' || e.key === ' ')) onOpenEditModal(card, columnIndex, cardIndex); }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-on-surface break-words pr-2">{card.title}</h4>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <button onClick={() => onOpenEditModal(card, columnIndex, cardIndex)} aria-label="Edit card" className="p-1 text-on-surface-variant hover:text-primary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
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
      {card.description && <p className="text-sm text-on-surface-variant mt-2 break-words whitespace-pre-wrap leading-relaxed">{card.description}</p>}
    </div>
  );
};

export default Card;