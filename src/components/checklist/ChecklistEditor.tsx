import React, { useState, useEffect, useRef } from 'react';
import { ChecklistData, ChecklistItem, Priority } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { PlusIcon, TrashIcon, DotsHorizontalIcon } from '../ui/Icons';

const PRIORITY_STYLES: { [key in Priority]: { base: string; text: string; label: string } } = {
    [Priority.HIGH]: { base: 'bg-red-500/20', text: 'text-red-400', label: 'High' },
    [Priority.MEDIUM]: { base: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Medium' },
    [Priority.LOW]: { base: 'bg-blue-500/20', text: 'text-blue-400', label: 'Low' },
};

const PRIORITY_CYCLE: Priority[] = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];


interface TaskItemProps {
    item: ChecklistItem;
    onToggle: (id: string) => void;
    onUpdate: (id: string, newText: string) => void;
    onDelete: (id: string) => void;
    onChangePriority: (id: string, priority: Priority) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    index: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ item, onToggle, onUpdate, onDelete, onChangePriority, onDragStart, onDragEnter, index }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);

    const handleEditBlur = () => {
        if (editText.trim() && editText.trim() !== item.text) {
            onUpdate(item.id, editText.trim());
        } else {
            setEditText(item.text);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditBlur();
        } else if (e.key === 'Escape') {
            setEditText(item.text);
            setIsEditing(false);
        }
    }

    const handlePriorityCycle = () => {
        const currentIndex = PRIORITY_CYCLE.indexOf(item.priority);
        const nextIndex = (currentIndex + 1) % PRIORITY_CYCLE.length;
        onChangePriority(item.id, PRIORITY_CYCLE[nextIndex]);
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnter={(e) => onDragEnter(e, index)}
            className={`flex items-center gap-3 p-3 bg-surface-container rounded-lg group transition-opacity ${item.completed ? 'opacity-60' : 'opacity-100'} focus-within:ring-2 focus-within:ring-primary`}
            tabIndex={-1}
        >
            <div className="cursor-grab text-on-surface-variant" title="Drag to reorder">
                <DotsHorizontalIcon className="w-5 h-5" />
            </div>
            <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle(item.id)}
                aria-label={item.text}
                className="w-5 h-5 rounded text-primary bg-surface border-outline focus:ring-primary focus:ring-offset-surface-container"
            />
            <div className="flex-grow">
                {isEditing ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-on-surface focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <button onClick={() => setIsEditing(true)} className={`w-full text-left rounded-sm focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary ${item.completed ? 'line-through' : ''}`}>
                        {item.text}
                    </button>
                )}
            </div>
            
            <button 
                onClick={handlePriorityCycle}
                aria-label={`Change priority for ${item.text}, current is ${PRIORITY_STYLES[item.priority].label}. Click to cycle priority.`}
                className={`text-xs font-bold px-2 py-1 rounded-full transition-transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-container ${PRIORITY_STYLES[item.priority].base} ${PRIORITY_STYLES[item.priority].text}`}
            >
                {PRIORITY_STYLES[item.priority].label}
            </button>

            <button onClick={() => onDelete(item.id)} aria-label={`Delete task: ${item.text}`} className="p-1 text-on-surface-variant hover:text-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


interface ChecklistEditorProps {
    initialChecklistData: ChecklistData;
    onChecklistUpdate: (newData: ChecklistData) => void;
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({ initialChecklistData, onChecklistUpdate }) => {
    const [items, setItems] = useState<ChecklistItem[]>(initialChecklistData);
    const [newItemText, setNewItemText] = useState('');
    
    const debouncedItems = useDebounce(items, 500);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        onChecklistUpdate(debouncedItems);
    }, [debouncedItems]);

    useEffect(() => {
        setItems(initialChecklistData);
    }, [initialChecklistData]);
    
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim()) {
            const newItem: ChecklistItem = {
                id: crypto.randomUUID(),
                text: newItemText.trim(),
                completed: false,
                priority: Priority.MEDIUM
            };
            setItems(prev => [...prev, newItem]);
            setNewItemText('');
        }
    };

    const updateItem = (id: string, updater: (item: ChecklistItem) => ChecklistItem) => {
        setItems(prev => prev.map(item => item.id === id ? updater(item) : item));
    }

    const handleToggleComplete = (id: string) => updateItem(id, item => ({...item, completed: !item.completed}));
    const handleUpdateText = (id: string, newText: string) => updateItem(id, item => ({...item, text: newText}));
    const handleChangePriority = (id: string, priority: Priority) => updateItem(id, item => ({...item, priority}));
    const handleDeleteItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

    const handleDrop = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newItems = [...items];
            const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
            newItems.splice(dragOverItem.current, 0, draggedItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            setItems(newItems);
        }
    };
    
    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return (
        <div className="max-w-3xl mx-auto h-full flex flex-col">
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-on-surface-variant">Progress</span>
                    <span className="text-sm font-bold text-on-surface">{progress}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            {/* Task List */}
            <div 
                className="space-y-3 flex-grow overflow-y-auto pr-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {items.map((item, index) => (
                    <TaskItem 
                        key={item.id}
                        item={item}
                        index={index}
                        onToggle={handleToggleComplete}
                        onUpdate={handleUpdateText}
                        onDelete={handleDeleteItem}
                        onChangePriority={handleChangePriority}
                        onDragStart={(e, i) => dragItem.current = i}
                        onDragEnter={(e, i) => dragOverItem.current = i}
                    />
                ))}
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="mt-4 flex gap-3">
                <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full p-3 rounded-lg bg-surface-container text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" aria-label="Add new task" className="bg-primary text-on-primary rounded-lg px-6 font-bold flex items-center justify-center hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default ChecklistEditor;