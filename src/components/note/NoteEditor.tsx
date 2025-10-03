import React, { useState, useEffect, useRef } from 'react';
import { NoteData } from '../../types';
import { parseMarkdown } from '../../utils/markdown';
import FormattingToolbar from './FormattingToolbar';
import { useDebounce } from '../../hooks/useDebounce';

interface NoteEditorProps {
    initialNoteData: NoteData;
    onNoteUpdate: (newData: NoteData) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNoteData, onNoteUpdate }) => {
    const [content, setContent] = useState(initialNoteData.content);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const debouncedContent = useDebounce(content, 500);

    useEffect(() => {
        if (debouncedContent !== initialNoteData.content) {
            onNoteUpdate({ content: debouncedContent });
        }
    }, [debouncedContent]);
    
    useEffect(() => {
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
                        className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'edit' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'preview' ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}
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
                        className="w-full h-full flex-grow p-4 rounded-b-md bg-surface text-on-surface border border-outline focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
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
                    line-height: 1.7;
                }
                .prose h1, .prose h2, .prose h3, .prose h4, .prose strong {
                     color: rgb(var(--color-on-surface));
                }
                .prose p, .prose li {
                    color: rgb(var(--color-on-surface-variant));
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