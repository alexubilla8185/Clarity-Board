import * as React from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { XMarkIcon, SparklesIcon, ViewGridIcon, ShieldCheckIcon, PlusIcon, DocumentTextIcon, ClipboardCheckIcon, SearchIcon } from '../ui/Icons';
import { changelogData } from '../../constants/changelog';

const QuickStartGuide: React.FC = () => (
    <div className="space-y-6 text-on-surface-variant">
        <h3 className="text-2xl font-bold text-on-surface">Welcome to Clarity Board!</h3>
        <p>Here’s a quick guide to get you started with the main features.</p>
        
        <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <PlusIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-lg font-semibold text-on-surface">Create Anything</h4>
                <p>Use the floating <span className="font-bold">+</span> button in the bottom right to add new items. You can choose from four types:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong className="text-on-surface flex items-center gap-2"><SparklesIcon className="w-5 h-5"/>Smart Split:</strong> Let AI create a project from your notes.</li>
                    <li><strong className="text-on-surface flex items-center gap-2"><ViewGridIcon className="w-5 h-5"/>Project:</strong> A Kanban board to visualize workflows. Switch between a top-down List view and a traditional Board view.</li>
                    <li><strong className="text-on-surface flex items-center gap-2"><ClipboardCheckIcon className="w-5 h-5"/>Checklist:</strong> For simple to-do lists.</li>
                    <li><strong className="text-on-surface flex items-center gap-2"><DocumentTextIcon className="w-5 h-5"/>Note:</strong> A powerful Markdown editor for your thoughts.</li>
                </ul>
            </div>
        </div>

        <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-lg font-semibold text-on-surface">Enhance Cards with AI</h4>
                <p>Supercharge individual tasks. Click the sparkles icon on any Kanban card to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong className="text-on-surface">Brainstorm:</strong> Generate related ideas and sub-tasks.</li>
                    <li><strong className="text-on-surface">Summarize:</strong> Condense long descriptions into key points.</li>
                    <li><strong className="text-on-surface">Improve:</strong> Refine your writing for clarity and professionalism.</li>
                </ul>
            </div>
        </div>

        <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <SearchIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-lg font-semibold text-on-surface">Universal Search</h4>
                <p>Quickly find anything across all your projects. Press <code className="bg-outline/20 text-on-surface px-1.5 py-0.5 rounded text-sm">Ctrl</code> + <code className="bg-outline/20 text-on-surface px-1.5 py-0.5 rounded text-sm">K</code> (or <code className="bg-outline/20 text-on-surface px-1.5 py-0.5 rounded text-sm">Cmd</code> + <code className="bg-outline/20 text-on-surface px-1.5 py-0.5 rounded text-sm">K</code> on Mac) to open the search bar.</p>
            </div>
        </div>

        <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary p-3 rounded-full mt-1 flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-lg font-semibold text-on-surface">100% Private & Offline</h4>
                <p>Your data is yours alone. Everything is stored locally in your browser, ensuring complete privacy and seamless offline access. No accounts, no cloud, no tracking.</p>
            </div>
        </div>
    </div>
);

const Changelog: React.FC = () => (
    <div className="space-y-8">
        {changelogData.map(release => (
            <div key={release.version}>
                <div className="flex items-baseline gap-4 mb-3">
                    <h3 className="text-xl font-bold text-on-surface">Version {release.version}</h3>
                    <span className="text-sm text-on-surface-variant">{release.date}</span>
                </div>
                <div className="space-y-4">
                    {Object.entries(release.changes).map(([type, changes]) => (
                        <div key={type}>
                            <h4 className={`text-sm font-semibold px-2 py-0.5 rounded-sm inline-block
                                ${type === 'Added' ? 'bg-green-500/20 text-green-500' : ''}
                                ${type === 'Changed' ? 'bg-blue-500/20 text-blue-500' : ''}
                                ${type === 'Fixed' ? 'bg-error/20 text-error' : ''}
                            `}>{type}</h4>
                            <ul className="list-disc ml-6 mt-2 space-y-2 text-on-surface-variant">
                                {changes.map((change, index) => {
                                    const formattedChange = change
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface">$1</strong>')
                                        .replace(/`([^`]+)`/g, '<code class="bg-outline/20 text-on-surface px-1 py-0.5 rounded text-sm">$&</code>');
                                    return <li key={index} dangerouslySetInnerHTML={{ __html: formattedChange }} />;
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = React.useState('guide');
    const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-scrim/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="help-title">
            <div ref={trapRef} className="bg-surface rounded-lg shadow-3 w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up">
                <header className="p-4 flex justify-between items-center border-b border-outline flex-shrink-0">
                    <h2 id="help-title" className="text-xl font-semibold text-on-surface">Help Center</h2>
                     <button onClick={onClose} aria-label="Close" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="border-b border-outline flex-shrink-0">
                    <div className="p-2 flex gap-2" role="tablist">
                        <button 
                            role="tab"
                            aria-selected={activeTab === 'guide'}
                            onClick={() => setActiveTab('guide')}
                            className={`px-4 py-2 text-sm font-semibold rounded-full ${activeTab === 'guide' ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container'}`}>
                            Quick Start
                        </button>
                        <button 
                            role="tab"
                            aria-selected={activeTab === 'changelog'}
                            onClick={() => setActiveTab('changelog')}
                            className={`px-4 py-2 text-sm font-semibold rounded-full ${activeTab === 'changelog' ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container'}`}>
                            Changes
                        </button>
                    </div>
                </div>

                <main className="p-6 overflow-y-auto">
                    {activeTab === 'guide' && <QuickStartGuide />}
                    {activeTab === 'changelog' && <Changelog />}
                </main>
            </div>
            <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default HelpModal;