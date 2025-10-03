import * as React from 'react';
import { BoardData, Card as CardType, Column as ColumnType, Project } from '../../types';
import Column from './Column';
import AIFeatureModal from './AIFeatureModal';
import Modal from '../ui/Modal';
import { PlusIcon, ViewGridIcon, Bars3Icon } from '../ui/Icons';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import Card from './Card';

// Helper component for editing a card
interface EditCardFormProps {
    card: CardType;
    onSave: (title: string, description: string) => void;
    onCancel: () => void;
}

const EditCardForm: React.FC<EditCardFormProps> = ({ card, onSave, onCancel }) => {
    const [title, setTitle] = React.useState(card.title);
    const [description, setDescription] = React.useState(card.description);

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
    project: Project;
    onProjectUpdate: (updates: Partial<Project>) => void;
    onDeleteColumn: (columnId: string) => void;
}

const Board: React.FC<BoardProps> = ({ project, onProjectUpdate, onDeleteColumn }) => {
  const [boardData, setBoardData] = React.useState<BoardData>(project.data as BoardData);

  React.useEffect(() => {
    setBoardData(project.data as BoardData);
  }, [project.data]);

  React.useEffect(() => {
    if (JSON.stringify(boardData) !== JSON.stringify(project.data)) {
      onProjectUpdate({ data: boardData });
    }
  }, [boardData, project.data, onProjectUpdate]);

  const [isAiModalOpen, setIsAiModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<CardType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingCardInfo, setEditingCardInfo] = React.useState<{ card: CardType } | null>(null);

  const [activeColumn, setActiveColumn] = React.useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = React.useState<CardType | null>(null);

  const viewMode = project.viewMode || 'board';

  const columnIds = React.useMemo(() => boardData.map(col => col.id), [boardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // require 10px of movement before activation
      }
    }),
    useSensor(KeyboardSensor)
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Column') {
      setActiveColumn(active.data.current.column);
      return;
    }
    if (active.data.current?.type === 'Card') {
      setActiveCard(active.data.current.card);
      return;
    }
  };
  
   const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    const isOverACard = over.data.current?.type === "Card";
    const isOverAColumn = over.data.current?.type === "Column";

    setBoardData((board) => {
      const activeColumn = board.find((col) => col.cards.some((card) => card.id === activeId));
      let overColumn = null;

      if (isOverACard) {
        overColumn = board.find((col) => col.cards.some((card) => card.id === overId));
      } else if (isOverAColumn) {
        overColumn = board.find((col) => col.id === overId);
      }

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return board;
      }
      
      const activeCardIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
      const [movedCard] = activeColumn.cards.splice(activeCardIndex, 1);
      
      if(isOverACard){
         const overCardIndex = overColumn.cards.findIndex((card) => card.id === overId);
         overColumn.cards.splice(overCardIndex, 0, movedCard);
      } else {
         overColumn.cards.push(movedCard);
      }

      return board.map(col => {
          if (col.id === activeColumn.id) return {...col, cards: [...activeColumn.cards]};
          if (col.id === overColumn.id) return {...col, cards: [...overColumn.cards]};
          return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveCard(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Handle Column dragging
    if (active.data.current?.type === 'Column' && viewMode === 'board') {
        setBoardData(columns => {
            const oldIndex = columns.findIndex(c => c.id === active.id);
            const newIndex = columns.findIndex(c => c.id === over.id);
            return arrayMove(columns, oldIndex, newIndex);
        });
        return;
    }

    // Handle Card dragging within the same column
    if (active.data.current?.type === 'Card') {
        setBoardData(prevData => {
            const activeColumn = prevData.find(col => col.cards.some(card => card.id === active.id));
            if (!activeColumn) return prevData;
            
            const overColumn = prevData.find(col => col.cards.some(card => card.id === over.id) || col.id === over.id);

            if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
                const activeCardIndex = activeColumn.cards.findIndex(card => card.id === active.id);
                const overCardIndex = overColumn.cards.findIndex(card => card.id === over.id);
                const newCards = arrayMove(activeColumn.cards, activeCardIndex, overCardIndex);
                return prevData.map(col => col.id === activeColumn.id ? {...col, cards: newCards} : col);
            }
            // Note: Dragging between columns is handled by onDragOver for a better UX
            return prevData;
        });
    }
  };


  const addColumn = () => {
    const newColumnTitle = `New Column ${boardData.length + 1}`;
    setBoardData(prev => [...prev, { id: crypto.randomUUID(), title: newColumnTitle, cards: [] }]);
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
      setBoardData(prev => prev.map(col => col.id === columnId ? {...col, title: newTitle} : col));
  }

  const addCard = (columnId: string, title: string) => {
    const newCard: CardType = { id: crypto.randomUUID(), title, description: '', lastModified: Date.now() };
    setBoardData(prev => prev.map(col => col.id === columnId ? {...col, cards: [...col.cards, newCard]} : col));
  };

  const deleteCard = (cardId: string) => {
    setBoardData(prev => {
        const newData = prev.map(col => ({
            ...col,
            cards: col.cards.filter(card => card.id !== cardId)
        }));
        return newData;
    });
  };

  const updateCard = (updatedCard: CardType) => {
      setBoardData(prev => {
          const newData = prev.map(col => ({
              ...col,
              cards: col.cards.map(card => card.id === updatedCard.id ? {...updatedCard, lastModified: Date.now()} : card)
          }));
          return newData;
      });
  }

  const handleOpenAiModal = (card: CardType) => {
    setSelectedCard(card);
    setIsAiModalOpen(true);
  };

  const handleAiUpdateCard = (updatedCard: CardType) => {
      updateCard(updatedCard);
      setSelectedCard(null);
  };

  const handleOpenEditModal = (card: CardType) => {
    setEditingCardInfo({ card });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (title: string, description: string) => {
    if (editingCardInfo) {
      const { card } = editingCardInfo;
      updateCard({ ...card, title, description });
      setIsEditModalOpen(false);
      setEditingCardInfo(null);
    }
  };

  const ListColumnDroppable = ({ id, children }: {id: string, children: React.ReactNode}) => {
    const { setNodeRef } = useDroppable({ id, data: { type: 'Column' } });
    return <div ref={setNodeRef} className="min-h-[80px] rounded-lg bg-black/5 dark:bg-white/5">{children}</div>;
  };

  return (
    <>
      <div className="flex justify-end mb-4">
          <div className="flex items-center bg-surface-container rounded-lg p-1">
              <button
                  onClick={() => onProjectUpdate({ viewMode: 'board' })}
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'board' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
                  aria-pressed={viewMode === 'board'}
              >
                  <ViewGridIcon className="w-5 h-5" />
                  Board
              </button>
              <button
                  onClick={() => onProjectUpdate({ viewMode: 'list' })}
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
                  aria-pressed={viewMode === 'list'}
              >
                  <Bars3Icon className="w-5 h-5" />
                  List
              </button>
          </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {viewMode === 'board' ? (
            <div className="flex items-start gap-6 overflow-x-auto pb-6">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {boardData.map((col) => (
                <Column
                    key={col.id}
                    column={col}
                    onAddCard={addCard}
                    onDeleteCard={deleteCard}
                    onDeleteColumn={() => onDeleteColumn(col.id)}
                    onUpdateColumnTitle={updateColumnTitle}
                    onOpenAiModal={handleOpenAiModal}
                    onOpenEditModal={handleOpenEditModal}
                />
                ))}
            </SortableContext>
            <button onClick={addColumn} className="bg-surface-container hover:bg-outline/20 transition-colors text-on-surface-variant font-medium rounded-lg w-80 flex-shrink-0 p-3 flex items-center justify-center h-20">
                <PlusIcon className="w-6 h-6 mr-2" /> Add another column
            </button>
            </div>
        ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
                {boardData.map(column => (
                    <section key={column.id} aria-labelledby={`list-column-title-${column.id}`}>
                        <h2 id={`list-column-title-${column.id}`} className="font-semibold text-xl text-on-surface mb-3 px-1">{column.title}</h2>
                        <ListColumnDroppable id={column.id}>
                            <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3 p-2">
                                    {column.cards.map(card => (
                                        <Card 
                                            key={card.id} 
                                            card={card} 
                                            onDelete={deleteCard}
                                            onOpenAiModal={handleOpenAiModal}
                                            onOpenEditModal={handleOpenEditModal}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </ListColumnDroppable>
                    </section>
                ))}
                 <button onClick={addColumn} className="w-full bg-surface-container hover:bg-outline/20 transition-colors text-on-surface-variant font-medium rounded-lg p-3 flex items-center justify-center h-20">
                    <PlusIcon className="w-6 h-6 mr-2" /> Add another section
                </button>
            </div>
        )}

        {createPortal(
            <DragOverlay>
                {activeColumn && (
                    <Column 
                        column={activeColumn}
                        onAddCard={() => {}}
                        onDeleteCard={() => {}}
                        onDeleteColumn={() => {}}
                        onUpdateColumnTitle={() => {}}
                        onOpenAiModal={() => {}}
                        onOpenEditModal={() => {}}
                    />
                )}
                {activeCard && (
                    <Card 
                        card={activeCard} 
                        onDelete={() => {}}
                        onOpenAiModal={() => {}}
                        onOpenEditModal={() => {}}
                    />
                )}
            </DragOverlay>,
            document.body
        )}

      </DndContext>

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
              <p className="text-on-surface-variant mt-2">Get started by adding a column or section.</p>
              <button onClick={addColumn} className="mt-6 bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors">
                Add Section
              </button>
          </div>
      )}
    </>
  );
};

export default Board;