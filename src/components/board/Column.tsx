import React, { useState } from 'react';
import { Column as ColumnType, Card as CardType } from '../../types';
import Card from './Card';
import { PlusIcon, TrashIcon } from '../ui/Icons';

interface ColumnProps {
  column: ColumnType;
  columnIndex: number;
  onAddCard: (columnIndex: number, title: string) => void;
  onDeleteCard: (columnIndex: number, cardIndex: number) => void;
  onDeleteColumn: () => void;
  onUpdateColumnTitle: (columnIndex: number, newTitle: string) => void;
  onOpenAiModal: (card: CardType) => void;
  onOpenEditModal: (card: CardType, columnIndex: number, cardIndex: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number, cardIndex: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, targetColumnIndex: number, targetCardIndex: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetColumnIndex: number) => void;
}

const Column: React.FC<ColumnProps> = ({ 
    column, columnIndex, onAddCard, onDeleteCard, onDeleteColumn, onUpdateColumnTitle, onOpenAiModal, onOpenEditModal, onDragStart, onDragEnter, onDrop
}) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(columnIndex, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleTitleBlur = () => {
    if (columnTitle.trim() && columnTitle.trim() !== column.title) {
      onUpdateColumnTitle(columnIndex, columnTitle.trim());
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

  return (
    <div 
        className="bg-surface-container rounded-lg w-80 flex-shrink-0 p-3 flex flex-col max-h-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, columnIndex)}
    >
      <div className="flex justify-between items-center mb-4">
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
        <button onClick={onDeleteColumn} aria-label={`Delete column ${column.title}`} className="p-1 text-on-surface-variant hover:text-error rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto flex-grow pr-1">
        {column.cards.map((card, cardIndex) => (
          <Card 
            key={card.id} 
            card={card} 
            columnIndex={columnIndex} 
            cardIndex={cardIndex} 
            onDelete={onDeleteCard}
            onOpenAiModal={onOpenAiModal}
            onOpenEditModal={onOpenEditModal}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
          />
        ))}
        {/* Drop zone at the end of the column */}
         <div onDragEnter={(e) => onDragEnter(e, columnIndex, column.cards.length)} className="h-2"/>
      </div>
      
      {isAddingCard ? (
        <form onSubmit={handleAddCard} className="mt-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            className="w-full p-2 rounded-md bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onBlur={() => setIsAddingCard(false)}
          />
          <button type="submit" className="hidden">Add</button>
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
