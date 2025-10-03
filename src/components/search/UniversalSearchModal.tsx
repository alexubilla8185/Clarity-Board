import * as React from 'react';
import { AppData, SearchResult, ProjectType } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { performSearch } from '../../utils/search';
import { SearchIcon, CloseIcon, ViewGridIcon, DocumentTextIcon, ClipboardCheckIcon } from '../ui/Icons';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onSelectResult: (projectId: string) => void;
}

const ProjectTypeIcon: React.FC<{ type: ProjectType }> = ({ type }) => {
    const commonClasses = "w-4 h-4 text-on-surface-variant";
    switch (type) {
        case ProjectType.BOARD: return <ViewGridIcon className={commonClasses} />;
        case ProjectType.NOTE: return <DocumentTextIcon className={commonClasses} />;
        case ProjectType.CHECKLIST: return <ClipboardCheckIcon className={commonClasses} />;
        default: return null;
    }
}

const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose, appData, onSelectResult }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setActiveIndex(-1);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (debouncedQuery) {
      const searchResults = performSearch(debouncedQuery, appData);
      setResults(searchResults);
      setActiveIndex(0);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, appData]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          onSelectResult(results[activeIndex].projectId);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, onSelectResult, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-scrim/80 z-50 flex justify-center pt-20"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-lg shadow-3 w-full max-w-2xl h-fit max-h-[80vh] flex flex-col mx-4 animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-4 border-b border-outline">
          <SearchIcon className="w-5 h-5 text-on-surface-variant" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search everything..."
            className="w-full bg-transparent text-on-surface text-lg focus:outline-none"
          />
           <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Close search">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto">
          {results.length > 0 ? (
            <ul className="p-2">
              {results.map((result, index) => (
                <li key={`${result.projectId}-${index}`}>
                  <button
                    onClick={() => onSelectResult(result.projectId)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left p-3 rounded-md flex flex-col gap-1 ${activeIndex === index ? 'bg-primary/20' : 'hover:bg-outline/10'}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <ProjectTypeIcon type={result.projectType} />
                      <span className="capitalize">{result.projectType}</span>
                      <span>&bull;</span>
                      <span>{result.projectCategoryName}</span>
                    </div>
                    <p className="font-semibold text-on-surface">{result.title}</p>
                    <p 
                      className="text-sm text-on-surface-variant"
                      dangerouslySetInnerHTML={{ __html: result.snippet || '...' }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-16 text-on-surface-variant">
              {query ? `No results for "${query}"` : 'Search for projects, notes, and tasks.'}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UniversalSearchModal;