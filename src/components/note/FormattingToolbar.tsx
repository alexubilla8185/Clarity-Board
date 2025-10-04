import * as React from 'react';

interface FormattingToolbarProps {
  onApplyFormat: (format: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol') => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="p-2 w-9 h-9 flex items-center justify-center rounded-sm hover:bg-outline/20 text-on-surface-variant transition-colors"
    >
        {children}
    </button>
);

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onApplyFormat }) => {
  return (
    <div className="flex items-center gap-1 bg-surface-container p-1 rounded-t-md border border-outline border-b-0">
      <ToolbarButton onClick={() => onApplyFormat('bold')} title="Bold">
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => onApplyFormat('italic')} title="Italic">
        <span className="italic">I</span>
      </ToolbarButton>
      <div className="border-l h-5 mx-1 border-outline"></div>
      <ToolbarButton onClick={() => onApplyFormat('h1')} title="Heading 1"><span className="label-medium font-bold">H1</span></ToolbarButton>
      <ToolbarButton onClick={() => onApplyFormat('h2')} title="Heading 2"><span className="label-medium font-bold">H2</span></ToolbarButton>
      <ToolbarButton onClick={() => onApplyFormat('h3')} title="Heading 3"><span className="label-medium font-bold">H3</span></ToolbarButton>
      <div className="border-l h-5 mx-1 border-outline"></div>
      <ToolbarButton onClick={() => onApplyFormat('ul')} title="Unordered List">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => onApplyFormat('ol')} title="Ordered List">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 5.5h2M1.5 11.5h2M1.5 17.5h2M8.5 6h14M8.5 12h14M8.5 18h14M4.5 5L3 5.5v.5m1.5 5L3 11.5v.5m1.5 5L3 17.5v.5" /></svg>
      </ToolbarButton>
    </div>
  );
};

export default FormattingToolbar;