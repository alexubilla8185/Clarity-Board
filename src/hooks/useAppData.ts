
import * as React from 'react';
import useLocalStorage from './useLocalStorage';
import { AppData, Project, ProjectType, UserSettings, BoardData, NoteData, ChecklistData, Card } from '../types';
import { INITIAL_APP_DATA, DEFAULT_USER_SETTINGS, EMPTY_APP_DATA } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { generateProjectFromText } from '../services/geminiService';

export function useAppData() {
  const [appData, setAppData] = useLocalStorage<AppData>('clarity-app-data', INITIAL_APP_DATA);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('clarity-user-settings', DEFAULT_USER_SETTINGS);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('clarity-has-onboarded', false);
  const [lastBackupDate, setLastBackupDate] = useLocalStorage<number | null>('clarity-last-backup', null);
  
  const { showToast } = useToast();

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setAppData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, ...updates, lastModified: Date.now() } : p
      )
    }));
  };

  const createItem = (name: string, type: 'project' | 'category', options?: { projectType?: ProjectType; categoryId?: string | null }) => {
    if (type === 'project' && options?.projectType) {
      let newData: BoardData | NoteData | ChecklistData;
      const newProjectBase = {
        id: crypto.randomUUID(),
        name,
        type: options.projectType,
        categoryId: options.categoryId !== undefined ? options.categoryId : null,
        lastModified: Date.now()
      };

      switch (options.projectType) {
        case ProjectType.NOTE:
          newData = { content: `# ${name}\n\nStart writing here.` };
          setAppData(prev => ({ ...prev, projects: [...prev.projects, { ...newProjectBase, data: newData }] }));
          break;
        case ProjectType.CHECKLIST:
          newData = [];
          setAppData(prev => ({ ...prev, projects: [...prev.projects, { ...newProjectBase, data: newData }] }));
          break;
        case ProjectType.BOARD:
        default:
          newData = [];
          setAppData(prev => ({ ...prev, projects: [...prev.projects, { ...newProjectBase, data: newData, viewMode: 'list' as const }] }));
          break;
      }
      return newProjectBase.id;
    } else if (type === 'category') {
      const newCategory = { id: crypto.randomUUID(), name, color: 'blue' };
      setAppData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    }
    return null;
  };

  const deleteColumn = (projectId: string, columnId: string) => {
    setAppData(prevAppData => ({
      ...prevAppData,
      projects: prevAppData.projects.map(p => {
        if (p.id === projectId && p.type === ProjectType.BOARD) {
          const updatedBoardData = (p.data as BoardData).filter(c => c.id !== columnId);
          return { ...p, data: updatedBoardData, lastModified: Date.now() };
        }
        return p;
      })
    }));
  };

  const handleSmartSplit = async (text: string) => {
    const aiResponse = await generateProjectFromText(text);
    const newCards: Card[] = aiResponse.tasks.map(task => ({
      id: crypto.randomUUID(),
      title: task.title,
      description: task.description,
      lastModified: Date.now(),
    }));

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: aiResponse.projectName,
      type: ProjectType.BOARD,
      categoryId: null,
      data: [{ id: crypto.randomUUID(), title: 'To Do', cards: newCards }, { id: crypto.randomUUID(), title: 'In Progress', cards: [] }, { id: crypto.randomUUID(), title: 'Done', cards: [] }],
      lastModified: Date.now(),
      viewMode: 'list'
    };
    
    setAppData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    return newProject.id;
  };

  const resetApp = () => {
    setAppData(INITIAL_APP_DATA);
    setUserSettings(DEFAULT_USER_SETTINGS);
    setHasOnboarded(false);
    setLastBackupDate(null);
  };

  return {
    appData, setAppData,
    userSettings, setUserSettings,
    hasOnboarded, setHasOnboarded,
    lastBackupDate, setLastBackupDate,
    updateProject,
    createItem,
    deleteColumn,
    handleSmartSplit,
    resetApp
  };
}
