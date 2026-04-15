import React, { useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  CodeIcon,
  ListIcon,
  QuoteIcon,
} from './Icons';

interface MarkdownEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Create new string with markdown syntax
    const newValue =
      value.substring(0, start) + before + selectedText + after + value.substring(end);

    // Create a synthetic event
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(event);

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="markdown-editor-container">
      <div className="markdown-toolbar">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="markdown-toolbar-btn"
          title="Bold"
        >
          <BoldIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="markdown-toolbar-btn"
          title="Italic"
        >
          <ItalicIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => insertText('<u>', '</u>')}
          className="markdown-toolbar-btn"
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>
        <div className="markdown-toolbar-divider" />
        <button
          type="button"
          onClick={() => insertText('[', '](url)')}
          className="markdown-toolbar-btn"
          title="Link"
        >
          <LinkIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => insertText('`', '`')}
          className="markdown-toolbar-btn"
          title="Inline Code"
        >
          <CodeIcon size={14} />
        </button>
        <div className="markdown-toolbar-divider" />
        <button
          type="button"
          onClick={() => insertText('- ')}
          className="markdown-toolbar-btn"
          title="List"
        >
          <ListIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => insertText('> ')}
          className="markdown-toolbar-btn"
          title="Quote"
        >
          <QuoteIcon size={14} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className={`markdown-textarea ${className}`.trim()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};
