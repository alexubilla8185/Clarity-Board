import * as React from 'react';
import Board from './components/board/Board';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import useLocalStorage from './hooks/useLocalStorage';
import { AppData, Project, Category, ProjectType, BoardData, NoteData, ChecklistData, Card, UserSettings, CurrentView } from './types';
import { INITIAL_APP_DATA, DEFAULT_USER_SETTINGS, EMPTY_APP_DATA } from './constants';
import FloatingActionButton from './components/ui/FloatingActionButton';
import NoteEditor from './components/note/NoteEditor';
import ChecklistEditor from './components/checklist/ChecklistEditor';
import SmartSplitModal from './components/ai/SmartSplitModal';
import { generateProjectFromText } from './services/geminiService';
import UniversalSearchModal from './components/search/UniversalSearchModal';
import ProjectList from './components/project/ProjectList';
import SettingsModal from './components/settings/SettingsModal';
import ConfirmationModal from './components/ui/ConfirmationModal';
import CreateProjectModal from './components/project/CreateProjectModal';
import { useToast } from './contexts/ToastContext';
import HelpModal from './components/help/HelpModal';
import WelcomeModal from './components/onboarding/WelcomeModal';
import LogOutConfirmationModal from './components/ui/LogOutConfirmationModal';

function App() {
  const [appData, setAppData] = useLocalStorage<AppData>('clarity-app-data', INITIAL_APP_DATA);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('clarity-user-settings', DEFAULT_USER_SETTINGS);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('clarity-has-onboarded', false);
  const [lastBackupDate, setLastBackupDate] = useLocalStorage<number | null>('clarity-last-backup', null);

  const [isSidebarOpen, setSidebarOpen] = React.useState(window.innerWidth > 768);
  const [currentView, setCurrentView] = React.useState<CurrentView>({ type: 'dashboard', id: null });
  
  // Modal states
  const [isWelcomeModalOpen, setWelcomeModalOpen] = React.useState(false);
  const [isSmartSplitModalOpen, setIsSmartSplitModalOpen] = React.useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false);
  const [isLogOutModalOpen, setLogOutModalOpen] = React.useState(false);

  const [confirmationState, setConfirmationState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    confirmText?: string;
    confirmButtonClass?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [createModalState, setCreateModalState] = React.useState<{
    isOpen: boolean;
    context: {
        type: 'project' | 'category';
        projectType?: ProjectType;
        categoryId?: string | null;
    } | null;
  }>({ isOpen: false, context: null });
  const { showToast } = useToast();
  
  React.useEffect(() => {
    if (!hasOnboarded) {
        setWelcomeModalOpen(true);
    }
  }, [hasOnboarded]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setSearchModalOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Effect for handling theme changes
  React.useEffect(() => {
    const root = window.document.documentElement;

    const applyCurrentTheme = () => {
        root.classList.remove('dark', 'true-dark'); // Clear previous theme classes

        let finalTheme: 'light' | 'dark' | 'true-dark' = 'light';

        if (userSettings.theme === 'dark' || userSettings.theme === 'true-dark') {
            finalTheme = userSettings.theme;
        } else if (userSettings.theme === 'system') {
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isSystemDark) {
                finalTheme = 'dark'; // System defaults to standard dark
            }
        }

        if (finalTheme === 'dark') {
            root.classList.add('dark');
        } else if (finalTheme === 'true-dark') {
            root.classList.add('dark'); // Add dark for base styles
            root.classList.add('true-dark'); // Add true-dark for overrides
        }
    };

    applyCurrentTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (userSettings.theme === 'system') {
        mediaQuery.addEventListener('change', applyCurrentTheme);
    }

    return () => {
        if (userSettings.theme === 'system') {
            mediaQuery.removeEventListener('change', applyCurrentTheme);
        }
    };
  }, [userSettings.theme]);

  // Effect for handling accent color changes
  React.useEffect(() => {
      document.documentElement.style.setProperty('--color-primary', userSettings.accentColor);
  }, [userSettings.accentColor]);

  // Onboarding Handlers
  const handleStartFresh = () => {
    setAppData(EMPTY_APP_DATA);
    setHasOnboarded(true);
    setWelcomeModalOpen(false);
    showToast('Welcome! Your new workspace is ready.', 'success');
  };

  const handleTrySampleData = () => {
    setAppData(INITIAL_APP_DATA);
    setHasOnboarded(true);
    setWelcomeModalOpen(false);
    showToast('Welcome! Explore the sample data to see what\'s possible.', 'success');
  };

  const handleOpenCreateModal = (
      type: 'project' | 'category',
      options?: { projectType?: ProjectType; categoryId?: string | null }
  ) => {
      setCreateModalState({
          isOpen: true,
          context: {
              type,
              ...options,
          },
      });
  };

  const handleCreateItem = (name: string) => {
    if (!createModalState.context) return;
    const { type, projectType, categoryId } = createModalState.context;

    if (type === 'project' && projectType) {
        let newData: BoardData | NoteData | ChecklistData;
        const newProjectBase = {
            id: crypto.randomUUID(),
            name,
            type: projectType,
            categoryId: categoryId !== undefined ? categoryId : null,
            lastModified: Date.now()
        };
        
        let newProject: Project;

        switch (projectType) {
            case ProjectType.NOTE:
                newData = { content: `# ${name}\n\nStart writing here.` };
                newProject = { ...newProjectBase, data: newData };
                break;
            case ProjectType.CHECKLIST:
                newData = [];
                newProject = { ...newProjectBase, data: newData };
                break;
            case ProjectType.BOARD:
            default:
                newData = [];
                newProject = { ...newProjectBase, data: newData, viewMode: 'list' };
                break;
        }

        setAppData(prev => ({
            ...prev,
            projects: [...prev.projects, newProject]
        }));
        setCurrentView({ type: 'project', id: newProject.id });
        showToast(`${projectType.charAt(0).toUpperCase() + projectType.slice(1)} created`, 'success');
    } else if (type === 'category') {
        const newCategory: Category = {
            id: crypto.randomUUID(),
            name,
            color: 'blue'
        };
        setAppData(prev => ({...prev, categories: [...prev.categories, newCategory]}));
        showToast('Category created', 'success');
    }

    setCreateModalState({ isOpen: false, context: null });
  };


  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setAppData(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
            p.id === projectId ? { ...p, ...updates, lastModified: Date.now() } : p
        )
    }));
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = appData.projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    const confirmAction = () => {
      setConfirmationState(prev => ({ ...prev, isOpen: false }));

      setTimeout(() => {
          setAppData(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p.id !== projectId)
          }));

          if (currentView.type === 'project' && currentView.id === projectId) {
            setCurrentView({ type: 'dashboard', id: null });
          }
          showToast(`Project "${projectToDelete.name}" deleted.`, 'info');
      }, 200);
    };

    setConfirmationState({
        isOpen: true,
        title: 'Delete Project?',
        message: `You are about to permanently delete "<strong>${projectToDelete.name}</strong>". This action cannot be undone.`,
        onConfirm: confirmAction,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = appData.categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;

    const confirmAction = () => {
        setConfirmationState(prev => ({ ...prev, isOpen: false }));

        setTimeout(() => {
            setAppData(prev => {
                const updatedProjects = prev.projects.map(p => p.categoryId === categoryId ? { ...p, categoryId: null } : p);
                const updatedCategories = prev.categories.filter(c => c.id !== categoryId);
                return { projects: updatedProjects, categories: updatedCategories };
            });
            showToast(`Category "${categoryToDelete.name}" deleted.`, 'info');
        }, 200);
    };

    setConfirmationState({
        isOpen: true,
        title: 'Delete Category?',
        message: `You are about to permanently delete "<strong>${categoryToDelete.name}</strong>". This will not delete its projects, but they will become uncategorized.`,
        onConfirm: confirmAction,
    });
  };
  
  const handleDeleteColumn = (projectId: string, columnId: string) => {
    const project = appData.projects.find(p => p.id === projectId);
    if (!project || project.type !== ProjectType.BOARD) return;
    
    const boardData = project.data as BoardData;
    const columnToDelete = boardData.find(c => c.id === columnId);
    if (!columnToDelete) return;

    const confirmAction = () => {
      setConfirmationState(prev => ({ ...prev, isOpen: false }));
      
      setTimeout(() => {
        setAppData(prevAppData => {
          const updatedProjects = prevAppData.projects.map(p => {
            if (p.id === projectId && p.type === ProjectType.BOARD) {
              const currentBoardData = p.data as BoardData;
              const updatedBoardData = currentBoardData.filter(c => c.id !== columnId);
              return { ...p, data: updatedBoardData, lastModified: Date.now() };
            }
            return p;
          });
          return { ...prevAppData, projects: updatedProjects };
        });
        showToast(`Column "${columnToDelete.title}" deleted.`, 'info');
      }, 200);
    };

    setConfirmationState({
      isOpen: true,
      title: 'Delete Column?',
      message: `You are about to permanently delete the column "<strong>${columnToDelete.title}</strong>" and all its cards. This action cannot be undone.`,
      onConfirm: confirmAction,
    });
  };


  const handleSmartSplitSubmit = async (text: string) => {
    try {
        const aiResponse = await generateProjectFromText(text);

        const newCards: Card[] = aiResponse.tasks.map(task => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description,
            lastModified: Date.now(),
        }));

        const newBoardData: BoardData = [
            { id: crypto.randomUUID(), title: 'To Do', cards: newCards },
            { id: crypto.randomUUID(), title: 'In Progress', cards: [] },
            { id: crypto.randomUUID(), title: 'Done', cards: [] },
        ];
        
        const newProject: Project = {
            id: crypto.randomUUID(),
            name: aiResponse.projectName,
            type: ProjectType.BOARD,
            categoryId: null, // Default to uncategorized
            data: newBoardData,
            lastModified: Date.now(),
            viewMode: 'list'
        };
        
        setAppData(prev => ({
            ...prev,
            projects: [...prev.projects, newProject]
        }));

        setCurrentView({ type: 'project', id: newProject.id });
        setIsSmartSplitModalOpen(false); // Close modal on success
        showToast(`Project "${aiResponse.projectName}" created from text.`, 'success');
    } catch (error: any) {
        console.error("Smart Split failed:", error);
        showToast(error.message || 'Failed to generate project.', 'error');
    }
  };

  const handleSelectSearchResult = (projectId: string) => {
    setCurrentView({ type: 'project', id: projectId });
    setSearchModalOpen(false);
  };

  const handleNavigateToProject = (projectId: string) => {
    setCurrentView({ type: 'project', id: projectId });
  };
  
  // Data Management and Logout
  const handleExportData = () => {
    const data = { appData, userSettings };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `clarity-board-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setLastBackupDate(Date.now());
    showToast('Data exported successfully!', 'success');
  };

  const resetApp = () => {
    setAppData(INITIAL_APP_DATA);
    setUserSettings(DEFAULT_USER_SETTINGS);
    setHasOnboarded(false); // Let the onboarding show on next visit
    setLastBackupDate(null);
    setCurrentView({ type: 'dashboard', id: null });
  }

  const handleLogOutAnyway = () => {
      resetApp();
      setLogOutModalOpen(false);
      showToast('You have been logged out. All data has been cleared.', 'info');
  };
  
  const handleExportAndLogOut = () => {
      handleExportData();
      resetApp();
      setLogOutModalOpen(false);
  }

  const handleClearAllData = () => {
    resetApp();
    showToast('All app data has been cleared.', 'info');
  };

  const handleDataImport = (data: { appData: AppData, userSettings: UserSettings }) => {
    setAppData(data.appData);
    setUserSettings(data.userSettings);
    showToast('Data imported successfully!', 'success');
    setCurrentView({ type: 'dashboard', id: null });
  };

  const handleInitiateDataImport = (data: { appData: AppData; userSettings: UserSettings }) => {
    const confirmAction = () => {
      setConfirmationState((prev) => ({ ...prev, isOpen: false }));
      setTimeout(() => {
        handleDataImport(data);
        setIsSettingsModalOpen(false); // Close settings modal after import
      }, 200);
    };

    setConfirmationState({
      isOpen: true,
      title: 'Import Data?',
      message: 'This will overwrite all current projects, categories, and settings. This action cannot be undone.',
      onConfirm: confirmAction,
      confirmText: 'Import',
      confirmButtonClass: 'bg-primary hover:bg-primary/90 text-on-primary',
    });
  };

  const activeProject = currentView.type === 'project' ? appData.projects.find(p => p.id === currentView.id) : null;

  const getPageTitle = (): string => {
      switch (currentView.type) {
          case 'project':
              return activeProject?.name || 'Project';
          case 'project-list':
              return 'All Projects';
          case 'dashboard':
          default:
              return 'Dashboard';
      }
  }

  const handleProjectUpdate = (updates: Partial<Project>) => {
    if (activeProject) {
        updateProject(activeProject.id, updates);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        appData={appData}
        setAppData={setAppData}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAddProject={(type, categoryId) => handleOpenCreateModal('project', { projectType: type, categoryId })}
        onAddCategory={() => handleOpenCreateModal('category')}
        onDeleteProject={handleDeleteProject}
        onDeleteCategory={handleDeleteCategory}
        userSettings={userSettings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onLogOut={() => setLogOutModalOpen(true)}
      />
       {/* Scrim for mobile sidebar */}
      {isSidebarOpen && (
        <button 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-scrim/50 z-30 md:hidden cursor-default"
            aria-label="Close sidebar"
        ></button>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header 
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          pageTitle={getPageTitle()}
        />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView.type === 'dashboard' && (
            <Dashboard 
              appData={appData} 
              onOpenSmartSplitModal={() => setIsSmartSplitModalOpen(true)}
              onSelectProject={handleNavigateToProject}
              onShowAllProjects={() => setCurrentView({ type: 'project-list', id: null })}
            />
          )}
          {currentView.type === 'project-list' && (
              <ProjectList
                appData={appData}
                onSelectProject={handleNavigateToProject}
                onBackToDashboard={() => setCurrentView({ type: 'dashboard', id: null })}
              />
          )}
          {currentView.type === 'project' && activeProject?.type === ProjectType.BOARD && (
            <Board 
              key={activeProject.id}
              project={activeProject}
              onProjectUpdate={handleProjectUpdate}
              onDeleteColumn={(columnId) => handleDeleteColumn(activeProject.id, columnId)}
            />
          )}
           {currentView.type === 'project' && activeProject?.type === ProjectType.NOTE && (
            <NoteEditor 
              key={activeProject.id}
              initialNoteData={activeProject.data as NoteData}
              onNoteUpdate={(updatedData) => updateProject(activeProject.id, { data: updatedData })}
            />
          )}
          {currentView.type === 'project' && activeProject?.type === ProjectType.CHECKLIST && (
            <ChecklistEditor
              key={activeProject.id}
              initialChecklistData={activeProject.data as ChecklistData}
              onChecklistUpdate={(updatedData) => updateProject(activeProject.id, { data: updatedData })}
            />
          )}
        </main>
      </div>

      {!isWelcomeModalOpen && (
        <FloatingActionButton 
            onAddProject={(type) => handleOpenCreateModal('project', { projectType: type })} 
            onOpenSmartSplitModal={() => setIsSmartSplitModalOpen(true)}
        />
      )}

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onStartFresh={handleStartFresh}
        onTrySampleData={handleTrySampleData}
      />

      <SmartSplitModal 
        isOpen={isSmartSplitModalOpen}
        onClose={() => setIsSmartSplitModalOpen(false)}
        onSubmit={handleSmartSplitSubmit}
      />

      <UniversalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        appData={appData}
        onSelectResult={handleSelectSearchResult}
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        onClearAllData={handleClearAllData}
        onInitiateDataImport={handleInitiateDataImport}
        onExportData={handleExportData}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmationState.onConfirm!}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        confirmButtonClass={confirmationState.confirmButtonClass}
      />

      <CreateProjectModal
        isOpen={createModalState.isOpen}
        onClose={() => setCreateModalState({ isOpen: false, context: null })}
        onSubmit={handleCreateItem}
        title={
            createModalState.context?.type === 'category' 
            ? 'Create New Category' 
            : `Create New ${createModalState.context?.projectType || ''}`
        }
        label={
            createModalState.context?.type === 'category' 
            ? 'Category Name'
            : `${createModalState.context?.projectType ? (createModalState.context.projectType.charAt(0).toUpperCase() + createModalState.context.projectType.slice(1)) : ''} Name`
        }
      />

        <HelpModal 
            isOpen={isHelpModalOpen}
            onClose={() => setHelpModalOpen(false)}
        />
        
        <LogOutConfirmationModal
            isOpen={isLogOutModalOpen}
            onClose={() => setLogOutModalOpen(false)}
            lastBackupDate={lastBackupDate}
            onExportAndLogOut={handleExportAndLogOut}
            onLogOutAnyway={handleLogOutAnyway}
        />
    </div>
  );
}

export default App;