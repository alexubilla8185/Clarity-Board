# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2025-10-03

### Changed
- **Default Board View**: Kanban projects now default to the 'List' view for a more streamlined initial experience.
- **Header UI**: The main header has been redesigned to be cleaner, removing the app name and consistently displaying a centered title for the current view.
- **Documentation**: Updated `README.md` and the in-app Help Center to accurately reflect all current features.

### Added
- Added comprehensive documentation to all key components.

### Fixed
- Minor accessibility improvements for keyboard navigation within modals.

## [1.5.0] - 2025-10-02

### Added
- **Help Center**: A new Help Center modal is now accessible from the sidebar.
- **Quick Start Guide**: The Help Center includes a guide to showcase the app's main features for new users.
- **Changelog Viewer**: The Help Center also features a tab to view the application's version history and changes.
- Added `README.md` and `CHANGELOG.md` to the project.

## [1.4.0] - 2025-10-02

### Added
- **Universal Search**: Press `Ctrl/Cmd + K` to open a universal search bar to find any project, note, or task instantly.
- **Project List View**: A new "All Projects" view is accessible from the Dashboard to see all your projects in a sortable list.

### Changed
- Improved keyboard navigation for modals and interactive elements.
- The Dashboard now provides a button to navigate to the "All Projects" view.

## [1.3.0] - 2025-10-02

### Added
- **Settings & Personalization**: A new Settings modal is now available.
- **Profile Settings**: Users can now set a display name and choose a custom or preset avatar.
- **Appearance Settings**: Added options for Light, Dark, and System themes.
- **Accent Colors**: Users can now choose from a palette of accent colors to personalize the UI.
- **Data Management**: Implemented "Export to JSON" and "Import from JSON" functionality for easy backups.
- **Danger Zone**: Added an option to clear all local application data.

## [1.2.0] - 2025-10-01

### Added
- **Project Types**: The app now supports three project types: Kanban Boards, Rich Notes (with Markdown), and Checklists.
- **Dashboard View**: A new central Dashboard is the default view, showing stats and recent activity.
- **Floating Action Button**: A new FAB allows for quick creation of any project type.
- **AI Smart Split**: Integrated Gemini AI to automatically create a Kanban project from unstructured text.

### Changed
- The application structure was refactored to support multiple projects and categories.
- Sidebar now organizes projects under collapsible, color-coded categories.
- Replaced the simple board view with a more dynamic project view system.

## [1.1.0] - 2025-10-01

### Added
- **Categories**: Users can now create, rename, color-code, and delete categories to organize their projects.
- Projects can be assigned to categories.
- An "Uncategorized" section handles projects without a category.

### Fixed
- Resolved a bug where deleting a column would sometimes cause a UI crash.
- Improved data persistence logic to prevent data loss on browser refresh.

## [1.0.0] - 2025-09-30

### Added
- **Initial Release of Clarity Board!**
- **Kanban Board**: Core functionality with draggable columns and cards.
- **Local Storage**: All board data is stored locally in the browser.
- **AI Text Enhancement**: Use Gemini AI to summarize, brainstorm, or improve text within cards.
- **PWA Support**: The application is fully installable and works offline.