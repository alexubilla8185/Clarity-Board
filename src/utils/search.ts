import { AppData, ProjectType, SearchResult, BoardData, NoteData, ChecklistData } from '../types';

const SNIPPET_LENGTH = 100; // Characters around the match

function createSnippet(text: string, regex: RegExp): string {
  // Using .exec on a global regex will find the first match and return an object with the index.
  // We must reset lastIndex because the same regex object is used across multiple calls in the search loop.
  regex.lastIndex = 0;
  const match = regex.exec(text);
  if (!match) return '';

  const matchTerm = match[0];
  const matchIndex = match.index;

  const halfSnippet = Math.floor(SNIPPET_LENGTH / 2);

  // Calculate start and end points for the snippet "window"
  const startIndex = Math.max(0, matchIndex - halfSnippet);
  const endIndex = Math.min(text.length, matchIndex + matchTerm.length + halfSnippet);

  let snippet = text.substring(startIndex, endIndex);

  // Add ellipses if the snippet is cut from the start or end of the original text
  if (startIndex > 0) snippet = '...' + snippet;
  if (endIndex < text.length) snippet = snippet + '...';
  
  // Use the global regex to replace all occurrences of the query within the generated snippet
  return snippet.replace(regex, `<mark>$&</mark>`);
}


export function performSearch(query: string, appData: AppData): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  const queryRegex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
  
  const getCategoryName = (categoryId: string | null): string => {
      if (!categoryId) return 'Uncategorized';
      return appData.categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  for (const project of appData.projects) {
    const projectCategoryName = getCategoryName(project.categoryId);

    // Search project name
    if (project.name.match(queryRegex)) {
      results.push({
        projectId: project.id,
        projectType: project.type,
        projectCategoryName,
        title: project.name,
        snippet: createSnippet(project.name, queryRegex),
      });
    }

    switch (project.type) {
      case ProjectType.BOARD:
        const boardData = project.data as BoardData;
        for (const column of boardData) {
          for (const card of column.cards) {
            let found = false;
            let snippet = '';

            if (card.title.match(queryRegex)) {
              found = true;
              snippet = createSnippet(card.title, queryRegex);
            } else if (card.description && card.description.match(queryRegex)) {
              found = true;
              snippet = createSnippet(card.description, queryRegex);
            }

            if (found) {
              results.push({
                projectId: project.id,
                projectType: project.type,
                projectCategoryName,
                title: card.title,
                snippet,
              });
            }
          }
        }
        break;
        
      case ProjectType.NOTE:
        const noteData = project.data as NoteData;
        if (noteData.content && noteData.content.match(queryRegex)) {
          results.push({
            projectId: project.id,
            projectType: project.type,
            projectCategoryName,
            title: project.name,
            snippet: createSnippet(noteData.content, queryRegex),
          });
        }
        break;

      case ProjectType.CHECKLIST:
        const checklistData = project.data as ChecklistData;
        for (const item of checklistData) {
          if (item.text.match(queryRegex)) {
            results.push({
              projectId: project.id,
              projectType: project.type,
              projectCategoryName,
              title: item.text,
              snippet: createSnippet(item.text, queryRegex),
            });
          }
        }
        break;
    }
  }

  return results;
}