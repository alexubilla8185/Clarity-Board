import * as React from 'react';
import { AppData, BoardData, ProjectType, ChecklistData, NoteData, Project } from '../../types';
import { SparklesIcon, PresentationChartLineIcon, ClockIcon, FolderIcon, ClipboardCheckIcon, ViewGridIcon, ProjectIcon } from '../ui/Icons';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  appData: AppData;
  onOpenSmartSplitModal: () => void;
  onSelectProject: (projectId: string) => void;
  onShowAllProjects: () => void;
}

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, onClick?: () => void }> = ({ title, value, icon, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className={`bg-surface-container p-3 sm:p-4 rounded-lg flex items-center gap-3 sm:gap-4 w-full text-left ${onClick ? 'hover:bg-outline/10 transition-colors' : 'cursor-default'}`}>
        <div className="bg-primary/20 p-2 sm:p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-on-surface-variant body-medium">{title}</p>
            <p className="text-on-surface headline-medium">{value}</p>
        </div>
    </button>
);

const ProjectSummaryCard: React.FC<{ project: Project; categoryName: string; onSelectProject: (id: string) => void; }> = ({ project, categoryName, onSelectProject }) => {
    
    const renderCardContent = () => {
        switch (project.type) {
            case ProjectType.BOARD: {
                const boardData = project.data as BoardData;
                const totalCards = boardData.reduce((sum, col) => sum + col.cards.length, 0);
                const doneColumn = boardData.find(col => col.title.toLowerCase() === 'done');
                const completedCards = doneColumn ? doneColumn.cards.length : 0;
                const progress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
                const statusSummary = boardData.map(col => `${col.cards.length} ${col.title}`).join(', ');

                return (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-on-surface-variant label-small">Progress</span>
                            <span className="font-bold text-on-surface label-small">{progress}%</span>
                        </div>
                        <div className="w-full bg-outline/20 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-on-surface-variant mt-2 truncate body-small">{statusSummary}</p>
                    </div>
                );
            }
            case ProjectType.CHECKLIST: {
                const checklistData = project.data as ChecklistData;
                const totalItems = checklistData.length;
                const completedItems = checklistData.filter(item => item.completed).length;
                const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                return (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-on-surface-variant label-small">{completedItems}/{totalItems} Completed</span>
                            <span className="font-bold text-on-surface label-small">{progress}%</span>
                        </div>
                        <div className="w-full bg-outline/20 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                );
            }
            case ProjectType.NOTE: {
                const noteData = project.data as NoteData;
                const snippet = noteData.content
                    .replace(/#+\s/g, '')
                    .replace(/(\*\*|__)(.*?)\1/g, '$2')
                    .replace(/(\*|_)(.*?)\1/g, '$2')
                    .replace(/\n/g, ' ')
                    .substring(0, 100);
                return (
                    <p className="text-on-surface-variant body-small">
                        {snippet}{snippet.length === 100 ? '...' : ''}
                    </p>
                );
            }
            default:
                return null;
        }
    };

    return (
        <button 
            onClick={() => onSelectProject(project.id)}
            className="w-full p-4 bg-surface-container rounded-lg text-left hover:bg-outline/10 transition-colors flex flex-col justify-between h-40"
        >
            <div>
                <div className="flex items-start justify-between">
                    <ProjectIcon type={project.type} className="w-6 h-6 text-primary" />
                    <p className="text-on-surface-variant body-small">
                        {formatDistanceToNow(new Date(project.lastModified), { addSuffix: true })}
                    </p>
                </div>
                <h3 className="text-on-surface mt-2 truncate title-medium">{project.name}</h3>
                <p className="text-on-surface-variant body-medium">{categoryName}</p>
            </div>
            <div className="mt-2">{renderCardContent()}</div>
        </button>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ appData, onOpenSmartSplitModal, onSelectProject, onShowAllProjects }) => {
    const { totalItems, completedItems } = appData.projects.reduce(
        (acc, project) => {
            if (project.type === ProjectType.BOARD && Array.isArray(project.data)) {
                const boardData = project.data as BoardData;
                acc.totalItems += boardData.reduce((cardSum, col) => cardSum + col.cards.length, 0);
                const doneColumn = boardData.find(col => col.title.toLowerCase() === 'done');
                if (doneColumn) {
                    acc.completedItems += doneColumn.cards.length;
                }
            } else if (project.type === ProjectType.CHECKLIST && Array.isArray(project.data)) {
                const checklistData = project.data as ChecklistData;
                acc.totalItems += checklistData.length;
                acc.completedItems += checklistData.filter(item => item.completed).length;
            }
            return acc;
        },
        { totalItems: 0, completedItems: 0 }
    );

    const recentProjects = [...appData.projects].sort((a, b) => b.lastModified - a.lastModified).slice(0, 6);

    return (
        <div className="space-y-8">
            {/* Stats */}
            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard title="Total Projects" value={appData.projects.length} icon={<FolderIcon className="w-5 h-5 sm:w-6 sm-h-6 text-primary" />} onClick={onShowAllProjects} />
                    <StatCard title="Total Items" value={totalItems} icon={<PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />} />
                    <StatCard title="Items Completed" value={completedItems} icon={<ClipboardCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />} />
                    <StatCard title="Categories" value={appData.categories.length} icon={<ViewGridIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />} onClick={onShowAllProjects} />
                </div>
            </section>
            
            {/* AI Feature Showcase */}
            <section className="bg-gradient-to-br from-primary/20 to-surface-container p-6 rounded-lg flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="bg-primary text-on-primary p-4 rounded-full">
                    <SparklesIcon className="w-10 h-10" />
                </div>
                <div className="flex-grow">
                    <h2 className="text-on-surface headline-small">Meet the new AI Smart Split</h2>
                    <p className="text-on-surface-variant mt-1 body-large">Paste a block of text and watch our AI automatically split it into organized tasks on your board.</p>
                </div>
                <button 
                    onClick={onOpenSmartSplitModal}
                    className="bg-primary text-on-primary h-10 px-6 rounded-full whitespace-nowrap hover:shadow-1 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 label-large"
                >
                    Try It Now
                </button>
            </section>
            
            {/* Recent Activity */}
            <section>
                <h2 className="text-on-surface mb-4 flex items-center gap-2 title-large">
                    <ClockIcon className="w-6 h-6 text-on-surface-variant" />
                    Recent Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {recentProjects.length > 0 ? recentProjects.map(project => (
                        <ProjectSummaryCard 
                            key={project.id}
                            project={project}
                            categoryName={appData.categories.find(c => c.id === project.categoryId)?.name || 'Uncategorized'}
                            onSelectProject={onSelectProject}
                        />
                    )) : (
                    <div className="col-span-full text-center text-on-surface-variant py-12 bg-surface-container rounded-lg">
                        <p className="title-large">No recent activity yet.</p>
                        <p className="mt-1 body-medium">Create a new project to get started!</p>
                    </div>
                    )}
                </div>
            </section>
        </div>
    );
};


export default Dashboard;