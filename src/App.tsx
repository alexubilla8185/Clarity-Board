
import * as React from 'react';
import Board from './components/board/Board';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import { useAppData } from './hooks/useAppData';
import { useTheme } from './hooks/useTheme';
import { ProjectType, CurrentView, Project } from './types';
import FloatingActionButton from './components/ui/FloatingActionButton';
import NoteEditor from './components/note/NoteEditor';
import ChecklistEditor from './components/checklist/ChecklistEditor';
import SmartSplitModal from './components/ai/SmartSplitModal';
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
  const { 
    appData, setAppData, userSettings, setUserSettings, hasOnboarded, setHasOnboarded, 
    lastBackupDate, setLastBackupDate, updateProject, createItem, deleteColumn, handleSmartSplit, resetApp 
  } = useAppData();
  
  useTheme(userSettings);
  const { showToast } = useToast();

  const [isSidebarOpen, setSidebarOpen] = React.useState(window.innerWidth > 768);
  const [currentView, setCurrentView] = React.useState<CurrentView>({ type: 'dashboard', id: null });
  
  // Modals
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [confirmationState, setConfirmationState] = React.useState<any>({ isOpen: false });
  const [createModalContext, setCreateModalContext] = React.useState<any>(null);

  React.useEffect(() => { if (!hasOnboarded) setActiveModal('welcome'); }, [hasOnboarded]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setActiveModal('search'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateSubmit = (name: string) => {
    const newId = createItem(name, createModalContext.type, createModalContext);
    if (newId) setCurrentView({ type: 'project', id: newId });
    setActiveModal(null);
  };

  const handleSmartSplitSubmit = async (text: string) => {
    try {
      const newId = await handleSmartSplit(text);
      setCurrentView({ type: 'project', id: newId });
      setActiveModal(null);
      showToast('Project created from text.', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDeleteProject = (id: string) => {
    const p = appData.projects.find(x => x.id === id);
    if (!p) return;
    setConfirmationState({
      isOpen: true, title: 'Delete Project?', message: `Delete "<strong>${p.name}</strong>"?`,
      onConfirm: () => {
        setAppData(prev => ({ ...prev, projects: prev.projects.filter(x => x.id !== id) }));
        if (currentView.id === id) setCurrentView({ type: 'dashboard', id: null });
        setConfirmationState({ isOpen: false });
      }
    });
  };

  const activeProject = currentView.type === 'project' ? appData.projects.find(p => p.id === currentView.id) : null;
  const pageTitle = currentView.type === 'project' ? activeProject?.name || 'Project' : currentView.type === 'project-list' ? 'All Projects' : 'Dashboard';

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} appData={appData} setAppData={setAppData}
        currentView={currentView} setCurrentView={setCurrentView} userSettings={userSettings}
        onAddProject={(type, categoryId) => { setCreateModalContext({ type: 'project', projectType: type, categoryId }); setActiveModal('create'); }}
        onAddCategory={() => { setCreateModalContext({ type: 'category' }); setActiveModal('create'); }}
        onDeleteProject={handleDeleteProject} onDeleteCategory={(id) => setAppData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))}
        onOpenSettings={() => setActiveModal('settings')} onOpenHelp={() => setActiveModal('help')} onLogOut={() => setActiveModal('logout')}
      />
      
      <div className={`relative flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} pageTitle={pageTitle} />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView.type === 'dashboard' && <Dashboard appData={appData} onOpenSmartSplitModal={() => setActiveModal('smartsplit')} onSelectProject={id => setCurrentView({ type: 'project', id })} onShowAllProjects={() => setCurrentView({ type: 'project-list', id: null })} />}
          {currentView.type === 'project-list' && <ProjectList appData={appData} onSelectProject={id => setCurrentView({ type: 'project', id })} onBackToDashboard={() => setCurrentView({ type: 'dashboard', id: null })} />}
          {activeProject?.type === ProjectType.BOARD && <Board key={activeProject.id} project={activeProject} onProjectUpdate={upd => updateProject(activeProject.id, upd)} onDeleteColumn={cid => deleteColumn(activeProject.id, cid)} />}
          {activeProject?.type === ProjectType.NOTE && <NoteEditor key={activeProject.id} initialNoteData={activeProject.data as any} onNoteUpdate={upd => updateProject(activeProject.id, { data: upd })} />}
          {activeProject?.type === ProjectType.CHECKLIST && <ChecklistEditor key={activeProject.id} initialChecklistData={activeProject.data as any} onChecklistUpdate={upd => updateProject(activeProject.id, { data: upd })} />}
        </main>
        <FloatingActionButton onAddProject={t => { setCreateModalContext({ type: 'project', projectType: t }); setActiveModal('create'); }} onOpenSmartSplitModal={() => setActiveModal('smartsplit')} />
      </div>

      <WelcomeModal isOpen={activeModal === 'welcome'} onStartFresh={() => { setAppData({ projects: [], categories: [] }); setHasOnboarded(true); setActiveModal(null); }} onTrySampleData={() => { setHasOnboarded(true); setActiveModal(null); }} />
      <SmartSplitModal isOpen={activeModal === 'smartsplit'} onClose={() => setActiveModal(null)} onSubmit={handleSmartSplitSubmit} />
      <UniversalSearchModal isOpen={activeModal === 'search'} onClose={() => setActiveModal(null)} appData={appData} onSelectResult={id => { setCurrentView({ type: 'project', id }); setActiveModal(null); }} />
      <SettingsModal isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} userSettings={userSettings} setUserSettings={setUserSettings} onClearAllData={resetApp} onInitiateDataImport={d => { setAppData(d.appData); setUserSettings(d.userSettings); setActiveModal(null); }} onExportData={() => { setLastBackupDate(Date.now()); showToast('Exported!'); }} />
      <ConfirmationModal isOpen={confirmationState.isOpen} onClose={() => setConfirmationState({ isOpen: false })} {...confirmationState} />
      <CreateProjectModal isOpen={activeModal === 'create'} onClose={() => setActiveModal(null)} onSubmit={handleCreateSubmit} title={createModalContext?.type === 'category' ? 'New Category' : 'New Project'} label="Name" />
      <HelpModal isOpen={activeModal === 'help'} onClose={() => setActiveModal(null)} />
      <LogOutConfirmationModal isOpen={activeModal === 'logout'} onClose={() => setActiveModal(null)} lastBackupDate={lastBackupDate} onLogOutAnyway={() => { resetApp(); setActiveModal(null); }} onExportAndLogOut={() => { resetApp(); setActiveModal(null); }} />
    </div>
  );
}

export default App;
