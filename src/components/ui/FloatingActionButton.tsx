import * as React from 'react';
import { PlusIcon, ViewGridIcon, DocumentTextIcon, ClipboardCheckIcon, SparklesIcon } from './Icons';
import { ProjectType } from '../../types';

interface FloatingActionButtonProps {
    onAddProject: (type: ProjectType) => void;
    onOpenSmartSplitModal: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAddProject, onOpenSmartSplitModal }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const actions = [
        { label: 'Note', icon: <DocumentTextIcon className="w-6 h-6" />, type: ProjectType.NOTE, disabled: false },
        { label: 'Checklist', icon: <ClipboardCheckIcon className="w-6 h-6" />, type: ProjectType.CHECKLIST, disabled: false },
        { label: 'Project', icon: <ViewGridIcon className="w-6 h-6" />, type: ProjectType.BOARD, disabled: false },
        { label: 'Smart Split', icon: <SparklesIcon className="w-6 h-6" />, type: 'smart-split' as const, disabled: false },
    ];

    const handleActionClick = (action: typeof actions[number]) => {
        if (action.disabled) return;

        if (action.type === 'smart-split') {
            onOpenSmartSplitModal();
        } else {
            onAddProject(action.type);
        }
        
        setIsOpen(false);
    };

    return (
        <div className="absolute bottom-6 right-6 z-40">
            <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                {actions.slice().reverse().map((action, index) => (
                    <button
                        key={action.label}
                        onClick={() => handleActionClick(action)}
                        disabled={action.disabled}
                        className="bg-surface-container rounded-lg shadow-2 p-3 flex items-center gap-3 w-48 text-on-surface-variant hover:text-on-surface hover:bg-outline/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface"
                        style={{ transitionDelay: `${isOpen ? index * 30 : 0}ms`}}
                        title={action.disabled ? `${action.label} (Coming Soon)` : action.label}
                        tabIndex={isOpen ? 0 : -1}
                    >
                        {action.icon}
                        <span className="label-large">{action.label}</span>
                    </button>
                ))}
            </div>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-on-primary rounded-full w-16 h-16 flex items-center justify-center shadow-3 mt-4 hover:bg-primary/90 transition-transform duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface"
                aria-label={isOpen ? 'Close actions' : 'Open actions'}
                aria-expanded={isOpen}
            >
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <PlusIcon className="w-8 h-8" />
                </div>
            </button>
        </div>
    );
};

export default FloatingActionButton;
