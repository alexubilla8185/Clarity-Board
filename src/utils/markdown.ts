// A simple markdown parser. Not exhaustive, but covers the basics.
export const parseMarkdown = (text: string): string => {
    if (!text) return '';
    
    let html = text
        // Escape HTML tags
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headings (e.g., #, ##, ###)
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold (**text** or __text__)
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/__(.*?)__/gim, '<strong>$1</strong>')
        // Italic (*text* or _text_)
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/_(.*?)_/gim, '<em>$1</em>');

    // Lists need to be processed line by line and grouped
    const lines = html.split('\n');
    let inUl = false;
    let inOl = false;
    html = lines.map(line => {
        let listLine = '';
        if (line.match(/^\s*[-*] /)) {
            if (!inUl) { listLine += '<ul>'; inUl = true; }
            if (inOl) { listLine += '</ol>'; inOl = false; }
            return listLine + '<li>' + line.replace(/^\s*[-*] /, '') + '</li>';
        }
        if (line.match(/^\s*\d+\. /)) {
            if (!inOl) { listLine += '<ol>'; inOl = true; }
            if (inUl) { listLine += '</ul>'; inUl = false; }
            return listLine + '<li>' + line.replace(/^\s*\d+\. /, '') + '</li>';
        }
        
        if (inUl) { listLine += '</ul>'; inUl = false; }
        if (inOl) { listLine += '</ol>'; inOl = false; }
        return listLine + (line ? `<p>${line}</p>` : '');

    }).join('');
    
    if (inUl) html += '</ul>';
    if (inOl) html += '</ol>';
    
    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    return html;
};