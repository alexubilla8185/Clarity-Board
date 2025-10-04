import * as React from 'react';
import { NoteData } from '../../types';
import { parseMarkdown } from '../../utils/markdown';
import FormattingToolbar from './FormattingToolbar';
import { useDebounce } from '../../hooks/useDebounce';

interface NoteEditorProps {
    initialNoteData: NoteData;
    onNoteUpdate: (newData: NoteData) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNoteData, onNoteUpdate }) => {
    const [content, setContent] = React.useState(initialNoteData.content);
    const [viewMode, setViewMode] = React.useState<'edit' | 'preview'>('edit');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const debouncedContent = useDebounce(content, 500);

    React.useEffect(() => {
        if (debouncedContent !== initialNoteData.content) {
            onNoteUpdate({ content: debouncedContent });
        }
    }, [debouncedContent]);
    
    React.useEffect(() => {
        setContent(initialNoteData.content);
    }, [initialNoteData.content]);
    
    const applyFormat = (format: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText;

        const currentLineStart = content.lastIndexOf('\n', start - 1) + 1;

        switch(format) {
            case 'bold':
                newText = `**${selectedText}**`;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                break;
            case 'h1':
            case 'h2':
            case 'h3':
                const prefix = {h1: '#', h2: '##', h3: '###'}[format];
                newText = `${prefix} ${content.substring(currentLineStart, end)}`;
                const fullLine = content.substring(0, currentLineStart) + newText + content.substring(end);
                setContent(fullLine);
                textarea.focus();
                return;
            case 'ul':
                newText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
                break;
            case 'ol':
                newText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
                break;
            default:
                newText = selectedText;
        }

        const updatedContent = content.substring(0, start) + newText + content.substring(end);
        setContent(updatedContent);
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(start, end + newText.length - selectedText.length), 0);
    };


    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="flex justify-end items-center mb-2">
                <div className="flex items-center bg-surface-container rounded-lg p-1">
                     <button 
                        onClick={() => setViewMode('edit')}
                        className={`px-3 py-1 rounded-md label-large ${viewMode === 'edit' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 rounded-md label-large ${viewMode === 'preview' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {viewMode === 'edit' ? (
                <div className="flex flex-col flex-grow">
                    <FormattingToolbar onApplyFormat={applyFormat} />
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full flex-grow p-4 rounded-b-md bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono body-large"
                        placeholder="Start writing your note..."
                    />
                </div>
            ) : (
                <div 
                    className="prose bg-surface p-6 rounded-md border border-outline flex-grow w-full max-w-none h-full overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                />
            )}
             <style>{`
                .prose {
                    color: rgb(var(--color-on-surface));
                }
                .prose h1 {
                    color: rgb(var(--color-on-surface));
                    font-size: 1.75rem; line-height: 2.25rem; font-weight: 400; /* headline-medium */
                }
                 .prose h2 {
                    color: rgb(var(--color-on-surface));
                    font-size: 1.375rem; line-height: 1.75rem; font-weight: 500; /* title-large */
                }
                 .prose h3 {
                    color: rgb(var(--color-on-surface));
                    font-size: 1rem; line-height: 1.5rem; font-weight: 500; letter-spacing: 0.009375em; /* title-medium */
                }
                .prose strong {
                     color: rgb(var(--color-on-surface));
                }
                .prose p, .prose li {
                    color: rgb(var(--color-on-surface-variant));
                    font-size: 1rem; line-height: 1.5rem; font-weight: 400; letter-spacing: 0.005em; /* body-large */
                }
                .prose a { color: rgb(var(--color-primary)); }
                .prose ul { list-style-type: disc; }
                .prose ol { list-style-type: decimal; }
                .prose > *:first-child { margin-top: 0; }
                .prose > *:last-child { margin-bottom: 0; }
            `}</style>
        </div>
    );
};

export default NoteEditor;