import { AppData, ProjectType, Priority, UserSettings } from './types';

export const EMPTY_APP_DATA: AppData = {
  categories: [],
  projects: [],
};

export const INITIAL_APP_DATA: AppData = {
  categories: [
    { id: 'cat-1', name: 'Productivity', color: 'blue' },
    { id: 'cat-2', name: 'Personal', color: 'green' },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Welcome Board',
      type: ProjectType.BOARD,
      categoryId: 'cat-1',
      lastModified: Date.now(),
      data: [
        {
          id: 'col-1',
          title: 'To Do',
          cards: [
            { id: 'card-1', title: 'Install Clarity Board', description: 'Add this app to your home screen for easy, offline access.', lastModified: Date.now() },
            { id: 'card-2', title: 'Explore Categories', description: 'Create, rename, and color-code categories in the new sidebar.', lastModified: Date.now() },
          ],
        },
        {
          id: 'col-2',
          title: 'In Progress',
          cards: [
            { id: 'card-3', title: 'Check out the Dashboard', description: 'The new home screen gives you a quick overview of your work.', lastModified: Date.now() },
          ],
        },
        {
          id: 'col-3',
          title: 'Done',
          cards: [
              { id: 'card-4', title: 'Welcome to Clarity Board v2!', description: 'Your new privacy-focused productivity hub. All data is stored locally on your device.', lastModified: Date.now() },
          ],
        },
      ],
    },
    {
      id: 'proj-2',
      name: 'My First Note',
      type: ProjectType.NOTE,
      categoryId: 'cat-2',
      lastModified: Date.now(),
      data: {
        content: '# Welcome to Rich Notes!\n\nThis is your first note. You can use **Markdown** to format your text.\n\n- Create lists\n- **Bold** and *italic* text\n- Add headings\n\nToggle between edit and preview modes to see your changes.'
      }
    },
    {
      id: 'proj-3',
      name: 'Shopping List',
      type: ProjectType.CHECKLIST,
      categoryId: 'cat-2',
      lastModified: Date.now(),
      data: [
        { id: 'item-1', text: 'Milk', completed: false, priority: Priority.MEDIUM },
        { id: 'item-2', text: 'Bread', completed: true, priority: Priority.MEDIUM },
        { id: 'item-3', text: 'Coffee Beans', completed: false, priority: Priority.HIGH },
        { id: 'item-4', text: 'Snacks for the week', completed: false, priority: Priority.LOW },
      ]
    }
  ]
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    name: 'Workspace',
    avatar: null,
    theme: 'system',
    accentColor: '59 130 246', // Default Blue
};

export const ACCENT_COLORS = [
    { name: 'Blue', value: '59 130 246' },
    { name: 'Green', value: '34 197 94' },
    { name: 'Purple', value: '168 85 247' },
    { name: 'Pink', value: '236 72 153' },
    { name: 'Orange', value: '249 115 22' },
    { name: 'Teal', value: '20 184 166' },
];
