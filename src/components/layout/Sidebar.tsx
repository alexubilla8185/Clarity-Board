
import * as React from 'react';
import { AppData, Category, ProjectType, UserSettings, CurrentView } from '../../types';
import { HomeIcon, PlusIcon, DotsHorizontalIcon, EditIcon, TrashIcon, ChevronDownIcon, ProjectIcon, QuestionMarkCircleIcon } from '../ui/Icons';
import Avatar from '../ui/Avatar';
import AvatarMenu from './AvatarMenu';

interface SidebarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    appData: AppData;
    setAppData: React.Dispatch<React.SetStateAction<AppData>>;
    currentView: CurrentView;
    setCurrentView: React.Dispatch<React.SetStateAction<CurrentView>>;
    onAddProject: (type: ProjectType, categoryId: string | null) => void;
    onAddCategory: () => void;
    onDeleteProject: (projectId: string) => void;
    onDeleteCategory: (categoryId: string) => void;
    userSettings: UserSettings;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
    onLogOut: () => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
    blue: 'bg-primary',
    green: 'bg-success',
    red: 'bg-error',
    yellow: 'bg-highlight',
    purple: 'bg-accent-purple',
    pink: 'bg-accent-pink',
    gray: 'bg-outline'
};

const CategoryItem: React.FC<{ 
    category: Category, 
    projects: AppData['projects'],
    setAppData: SidebarProps['setAppData'],
    setCurrentView: SidebarProps['setCurrentView'],
    currentView: SidebarProps['currentView'],
    onAddProject: SidebarProps['onAddProject'],
    onDeleteProject: SidebarProps['onDeleteProject'],
    onDeleteCategory: (categoryId: string) => void;
}> = ({ category, projects, setAppData, setCurrentView, currentView, onAddProject, onDeleteProject, onDeleteCategory }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState(category.name);
    const [isMenuOpen, setMenuOpen] = React.useState(false);
    const [isExpanded, setExpanded] = React.useState(true);

    const categoryProjects = projects.filter(p => p.categoryId === (category.id === 'null' ? null : category.id));

    const handleRename = () => {
        if (name.trim() && category.id !== 'null') {
            setAppData(prev => ({
                ...prev,
                categories: prev.categories.map(c => c.id === category.id ? { ...c, name: name.trim() } : c)
            }));
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
         if (category.id !== 'null') {
            onDeleteCategory(category.id);
        }
        setMenuOpen(false);
    };
    
    const handleSetColor = (color: string) => {
        if(category.id === 'null') return;
        setAppData(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === category.id ? { ...c, color } : c)
        }));
        setMenuOpen(false);
    }
    
    const handleAddNewProject = () => {
      // Default to adding a Board from the sidebar for simplicity.
      onAddProject(ProjectType.BOARD, category.id === 'null' ? null : category.id);
    };


    return (
        <div>
            <div className="flex items-center justify-between group px-2 py-2 rounded-md hover:bg-surface-container">
                <button onClick={() => setExpanded(!isExpanded)} aria-expanded={isExpanded} className="flex items-center gap-2 flex-grow text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                    <ChevronDownIcon className={`w-4 h-4 text-on-surface-variant transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category.color] || 'bg-outline'}`}></span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            className="bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:outline-none rounded w-full label-large"
                            autoFocus
                            disabled={category.id === 'null'}
                        />
                    ) : (
                        <span className="text-on-surface flex-grow label-large">{category.name}</span>
                    )}
                </button>
                <div className="relative">
                     {category.id !== 'null' && (
                        <button 
                            onClick={() => setMenuOpen(!isMenuOpen)} 
                            aria-expanded={isMenuOpen}
                            aria-controls={`category-menu-${category.id}`}
                            aria-label={`Options for ${category.name} category`}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-outline/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <DotsHorizontalIcon className="w-4 h-4 text-on-surface-variant" />
                        </button>
                     )}
                    {isMenuOpen && (
                        <div id={`category-menu-${category.id}`} className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-3 z-10 p-2 border border-outline">
                             <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-surface-container flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary body-medium"><EditIcon className="w-4 h-4"/> Rename</button>
                             <button onClick={handleDelete} className="w-full text-left px-3 py-2 rounded text-error hover:bg-error/10 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary body-medium"><TrashIcon className="w-4 h-4"/> Delete</button>
                             <div className="border-t border-outline my-1"></div>
                             <div className="p-1 flex justify-around">
                                {Object.keys(CATEGORY_COLORS).filter(c => c !== 'gray').map(color => (
                                    <button key={color} aria-label={`Set category color to ${color}`} onClick={() => handleSetColor(color)} className={`w-6 h-6 rounded-full ${CATEGORY_COLORS[color]} ring-2 ring-offset-2 ring-offset-surface ${category.color === color ? 'ring-primary' : 'ring-transparent'} focus:outline-none focus:ring-2 focus:ring-primary`}></button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
            {isExpanded && (
                <div className="pl-4 border-l-2 border-surface-container ml-4">
                    {categoryProjects.map(project => (
                        <div key={project.id} className="flex items-center group pr-1">
                            <button 
                                onClick={() => setCurrentView({ type: 'project', id: project.id })}
                                className={`flex-grow text-left flex items-center gap-2 px-2 py-2 rounded-md truncate focus:outline-none focus:ring-2 focus:ring-primary body-medium ${currentView.id === project.id ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
                            >
                                <ProjectIcon type={project.type} className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{project.name}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject(project.id);
                                }}
                                className="p-1 text-on-surface-variant hover:text-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`Delete project ${project.name}`}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddNewProject} className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-md text-on-surface-variant hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary body-medium">
                        <PlusIcon className="w-4 h-4" /> Add new project...
                    </button>
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, appData, setAppData, currentView, setCurrentView, onAddProject, onAddCategory, onDeleteProject, onDeleteCategory, userSettings, onOpenSettings, onOpenHelp, onLogOut }) => {
    
    const uncategorizedProjects = appData.projects.filter(p => p.categoryId === null);
    const [isAvatarMenuOpen, setAvatarMenuOpen] = React.useState(false);

    return (
        <aside className={`fixed top-0 left-0 h-full w-64 bg-surface z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-outline flex flex-col`}>
            <div className="p-4 flex items-center gap-3 flex-shrink-0">
                <img src="public/favicon.svg" alt="Clarity Board Logo" className="w-8 h-8" />
                <h1 className="text-on-surface headline-small">
                    <span className="text-primary">Clarity</span> Board
                </h1>
            </div>
            <nav className="flex-grow px-2 py-4 space-y-4 overflow-y-auto" aria-label="Main navigation">
                <div>
                     <button 
                        onClick={() => setCurrentView({ type: 'dashboard', id: null })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary label-large ${currentView.type === 'dashboard' ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container text-on-surface'}`}
                    >
                        <HomeIcon className="w-5 h-5" /> Dashboard
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="uppercase text-on-surface-variant label-medium">Categories</h2>
                         <button onClick={onAddCategory} aria-label="Add new category" className="p-1 rounded-full hover:bg-outline/20 focus:outline-none focus:ring-2 focus:ring-primary">
                            <PlusIcon className="w-4 h-4 text-on-surface-variant" />
                        </button>
                    </div>
                    {appData.categories.map(cat => (
                        <CategoryItem 
                            key={cat.id} 
                            category={cat} 
                            projects={appData.projects}
                            setAppData={setAppData}
                            setCurrentView={setCurrentView}
                            currentView={currentView}
                            onAddProject={onAddProject}
                            onDeleteProject={onDeleteProject}
                            onDeleteCategory={onDeleteCategory}
                        />
                    ))}
                     {uncategorizedProjects.length > 0 && (
                        <CategoryItem
                            category={{id: 'null', name: 'Uncategorized', color: 'gray'}}
                            projects={appData.projects}
                            setAppData={setAppData}
                            setCurrentView={setCurrentView}
                            currentView={currentView}
                            onAddProject={onAddProject}
                            onDeleteProject={onDeleteProject}
                            onDeleteCategory={onDeleteCategory}
                         />
                     )}
                </div>
            </nav>
            <div className="p-2 border-t border-outline flex items-center gap-2 relative">
                <button
                    id="user-menu-button" 
                    onClick={() => setAvatarMenuOpen(!isAvatarMenuOpen)}
                    aria-expanded={isAvatarMenuOpen}
                    aria-haspopup="true"
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary flex-grow">
                    <Avatar userSettings={userSettings} size="sm" />
                    <span className="text-on-surface truncate label-large">{userSettings.name}</span>
                </button>
                <button onClick={onOpenHelp} aria-label="Open help center" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                </button>

                {isAvatarMenuOpen && (
                    <AvatarMenu 
                        onClose={() => setAvatarMenuOpen(false)}
                        onOpenSettings={onOpenSettings}
                        onLogOut={onLogOut}
                    />
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
