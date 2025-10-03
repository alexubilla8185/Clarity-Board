export interface Card {
  id: string;
  title: string;
  description: string;
  lastModified: number;
}

export interface Column {
  id:string;
  title: string;
  cards: Card[];
}

export type BoardData = Column[];

export interface NoteData {
  content: string;
}

export enum Priority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    priority: Priority;
}

export type ChecklistData = ChecklistItem[];


export enum AIOption {
    SUMMARIZE = 'SUMMARIZE',
    BRAINSTORM = 'BRAINSTORM',
    IMPROVE = 'IMPROVE',
}

// New types for multi-project structure

export interface Category {
  id: string;
  name: string;
  color: string; // e.g., 'blue', 'green', 'red'
}

export enum ProjectType {
  BOARD = 'board',
  NOTE = 'note',
  CHECKLIST = 'checklist'
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  categoryId: string | null; // null for uncategorized
  data: BoardData | NoteData | ChecklistData; // Can now be either board, note or checklist data
  lastModified: number;
}

export interface AppData {
  categories: Category[];
  projects: Project[];
}

// FIX: Add a shared type for the current view state.
export type CurrentView = {
  type: 'dashboard' | 'project' | 'project-list';
  id: string | null;
};

export interface SearchResult {
  projectId: string;
  projectType: ProjectType;
  projectCategoryName: string;
  title: string;
  snippet: string;
}

// Settings and Personalization
export interface UserSettings {
    name: string;
    avatar: { type: 'preset' | 'custom'; value: string } | null;
    theme: 'light' | 'dark' | 'system';
    accentColor: string; // Stored as an RGB string e.g., "59 130 246"
}