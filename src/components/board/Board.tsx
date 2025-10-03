import React, { useState, useRef, useEffect } from 'react';
import { BoardData, Card as CardType } from '../../types';
import Column from './Column';
import AIFeatureModal from './AIFeatureModal';
import Modal from '../ui/Modal';
import { PlusIcon } from '../ui/Icons';

// Helper component for editing a card
interface EditCardFormProps {
    card: CardType;
    onSave: (title: string, description: string) => void;
    onCancel: () => void;
}

const EditCardForm: React.FC<EditCardFormProps> = ({ card, onSave, onCancel }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title.trim(), description.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded-sm bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-2 rounded-sm bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="bg-surface-container hover:bg-outline/20 text-on-surface font-medium py-2 px-4 rounded-sm transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-sm transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

interface BoardProps {
    initialBoardData: BoardData;
    onBoardUpdate: (newData: BoardData) => void;
    onDeleteColumn: (columnId: string) => void;
}


const Board: React.FC<BoardProps> = ({ initialBoardData, onBoardUpdate, onDeleteColumn }) => {
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);

  useEffect(() => {
    setBoardData(initialBoardData);
  }, [initialBoardData]);

  useEffect(() => {
    if (JSON.stringify(boardData) !== JSON.stringify(initialBoardData)) {
      onBoardUpdate(boardData);
    }
  }, [boardData, initialBoardData, onBoardUpdate]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCardInfo, setEditingCardInfo] = useState<{ card: CardType, colIndex: number, cardIndex: number } | null>(null);

  const dragItem = useRef<{ colIndex: number; cardIndex: number } | null>(null);
  const dragOverItem = useRef<{ colIndex: number; cardIndex: number } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, colIndex: number, cardIndex: number) => {
    dragItem.current = { colIndex, cardIndex };
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, colIndex: number, cardIndex: number) => {
    dragOverItem.current = { colIndex, cardIndex };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColIndex: number) => {
    if (dragItem.current) {
        const { colIndex: sourceColIndex, cardIndex: sourceCardIndex } = dragItem.current;
        const targetCardIndex = dragOverItem.current ? dragOverItem.current.cardIndex : boardData[targetColIndex].cards.length;

        if (sourceColIndex === targetColIndex && sourceCardIndex === targetCardIndex) {
            return;
        }

        setBoardData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const draggedCard = newData[sourceColIndex].cards.splice(sourceCardIndex, 1)[0];
            
            if (sourceColIndex === targetColIndex) {
                 newData[targetColIndex].cards.splice(targetCardIndex > sourceCardIndex ? targetCardIndex -1 : targetCardIndex, 0, draggedCard);
            } else {
                 newData[targetColIndex].cards.splice(targetCardIndex, 0, draggedCard);
            }
           
            return newData;
        });

        dragItem.current = null;
        dragOverItem.current = null;
    }
  };

  const addColumn = () => {
    const newColumnTitle = `New Column ${boardData.length + 1}`;
    setBoardData(prev => [...prev, { id: crypto.randomUUID(), title: newColumnTitle, cards: [] }]);
  };

  const updateColumnTitle = (colIndex: number, newTitle: string) => {
      setBoardData(prev => {
          const newData = [...prev];
          newData[colIndex].title = newTitle;
          return newData;
      })
  }

  const addCard = (colIndex: number, title: string) => {
    const newCard: CardType = { id: crypto.randomUUID(), title, description: '', lastModified: Date.now() };
    setBoardData(prev => {
      const newData = [...prev];
      newData[colIndex].cards.push(newCard);
      return newData;
    });
  };

  const deleteCard = (colIndex: number, cardIndex: number) => {
    setBoardData(prev => {
      const newData = [...prev];
      newData[colIndex].cards.splice(cardIndex, 1);
      return newData;
    });
  };

  const updateCard = (colIndex: number, cardIndex: number, updatedCard: CardType) => {
      setBoardData(prev => {
          const newData = [...prev];
          newData[colIndex].cards[cardIndex] = { ...updatedCard, lastModified: Date.now() };
          return newData;
      });
  }

  const handleOpenAiModal = (card: CardType) => {
    setSelectedCard(card);
    setIsAiModalOpen(true);
  };

  const handleAiUpdateCard = (updatedCard: CardType) => {
      setBoardData(prev => {
          const newData = [...prev];
          for (let i = 0; i < newData.length; i++) {
              const cardIndex = newData[i].cards.findIndex(c => c.id === updatedCard.id);
              if (cardIndex !== -1) {
                  newData[i].cards[cardIndex] = { ...updatedCard, lastModified: Date.now() };
                  break;
              }
          }
          return newData;
      });
      setSelectedCard(null);
  };

  const handleOpenEditModal = (card: CardType, colIndex: number, cardIndex: number) => {
    setEditingCardInfo({ card, colIndex, cardIndex });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (title: string, description: string) => {
    if (editingCardInfo) {
      const { colIndex, cardIndex, card } = editingCardInfo;
      updateCard(colIndex, cardIndex, { ...card, title, description });
      setIsEditModalOpen(false);
      setEditingCardInfo(null);
    }
  };

  return (
    <>
      <div className="flex items-start gap-6 overflow-x-auto pb-6">
        {boardData.map((col, colIndex) => (
          <Column
            key={col.id}
            column={col}
            columnIndex={colIndex}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onDeleteColumn={() => onDeleteColumn(col.id)}
            onUpdateColumnTitle={updateColumnTitle}
            onOpenAiModal={handleOpenAiModal}
            onOpenEditModal={handleOpenEditModal}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
          />
        ))}
        <button onClick={addColumn} className="bg-surface-container hover:bg-outline/20 transition-colors text-on-surface-variant font-medium rounded-lg w-80 flex-shrink-0 p-3 flex items-center justify-center h-20">
          <PlusIcon className="w-6 h-6 mr-2" /> Add another column
        </button>
      </div>

      <AIFeatureModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        card={selectedCard}
        onUpdateCard={handleAiUpdateCard}
      />
      
      {editingCardInfo && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Card"
        >
          <EditCardForm 
            card={editingCardInfo.card}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {boardData.length === 0 && (
          <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-on-surface">This project is empty.</h2>
              <p className="text-on-surface-variant mt-2">Get started by adding a column.</p>
              <button onClick={addColumn} className="mt-6 bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors">
                Add a Column
              </button>
          </div>
      )}
    </>
  );
};

export default Board;