import * as React from 'react';
import { Column as ColumnType, Card as CardType } from '../../types';
import Card from './Card';
import { PlusIcon, TrashIcon, CloseIcon } from '../ui/Icons';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onOpenAiModal: (card: CardType) => void;
  onOpenEditModal: (card: CardType) => void;
}

const Column: React.FC<ColumnProps> = ({ 
    column, onAddCard, onDeleteCard, onDeleteColumn, onUpdateColumnTitle, onOpenAiModal, onOpenEditModal
}) => {
  const [newCardTitle, setNewCardTitle] = React.useState('');
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [columnTitle, setColumnTitle] = React.useState(column.title);

  const cardIds = React.useMemo(() => column.cards.map(card => card.id), [column.cards]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const submitNewCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    submitNewCard();
  };

  const handleTitleBlur = () => {
    if (columnTitle.trim() && columnTitle.trim() !== column.title) {
      onUpdateColumnTitle(column.id, columnTitle.trim());
    } else {
        setColumnTitle(column.title);
    }
    setIsEditingTitle(false);
  }
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleTitleBlur();
      } else if (e.key === 'Escape') {
          setColumnTitle(column.title);
          setIsEditingTitle(false);
      }
  }

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="bg-outline/20 border-2 border-outline border-dashed rounded-lg w-80 flex-shrink-0 p-3 flex flex-col max-h-full"
      />
    );
  }

  return (
    <div 
        ref={setNodeRef}
        style={style}
        className="bg-surface-container rounded-lg w-80 flex-shrink-0 p-3 flex flex-col max-h-full"
    >
      <div {...attributes} {...listeners} className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing">
        {isEditingTitle ? (
            <input 
                type="text"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="bg-surface text-on-surface font-semibold text-lg p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
        ) : (
            <h3 className="font-semibold text-lg text-on-surface w-full">
                <button onClick={() => setIsEditingTitle(true)} className="w-full text-left p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                    {column.title}
                </button>
            </h3>
        )}
        <button onClick={() => onDeleteColumn(column.id)} aria-label={`Delete column ${column.title}`} className="p-1 text-on-surface-variant hover:text-error rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto flex-grow pr-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onDelete={onDeleteCard}
              onOpenAiModal={onOpenAiModal}
              onOpenEditModal={onOpenEditModal}
            />
          ))}
        </SortableContext>
      </div>
      
      {isAddingCard ? (
        <form onSubmit={handleAddCard} className="mt-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            className="w-full p-2 rounded-md bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitNewCard();
              }
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-on-primary font-semibold py-1.5 px-3 rounded-sm text-sm transition-colors"
            >
              Add card
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              aria-label="Cancel adding card"
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-outline/10"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAddingCard(true)}
          className="mt-2 w-full text-left p-2 rounded-md text-on-surface-variant hover:bg-outline/10 hover:text-on-surface transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add a card
        </button>
      )}
    </div>
  );
};

export default Column;