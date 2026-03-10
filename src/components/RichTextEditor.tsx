import React, { useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface Props {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ html, onChange, placeholder }: Props) {
  const contentEditable = useRef<HTMLElement>(null);

  const handleChange = (evt: ContentEditableEvent) => {
    onChange(evt.target.value);
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditable.current) {
      contentEditable.current.focus();
    }
  };

  return (
    <div className="border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-zinc-900 transition-shadow">
      <div className="bg-zinc-50 p-1.5 flex gap-1 border-b border-zinc-200 flex-wrap">
        <ToolbarButton onClick={() => exec('bold')} icon={<Bold size={16} />} title="Bold" />
        <ToolbarButton onClick={() => exec('italic')} icon={<Italic size={16} />} title="Italic" />
        <ToolbarButton onClick={() => exec('underline')} icon={<Underline size={16} />} title="Underline" />
        <div className="w-px bg-zinc-300 mx-1 my-1" />
        <ToolbarButton onClick={() => exec('justifyLeft')} icon={<AlignLeft size={16} />} title="Align Left" />
        <ToolbarButton onClick={() => exec('justifyCenter')} icon={<AlignCenter size={16} />} title="Align Center" />
        <ToolbarButton onClick={() => exec('justifyRight')} icon={<AlignRight size={16} />} title="Align Right" />
      </div>
      <ContentEditable
        innerRef={contentEditable}
        html={html}
        disabled={false}
        onChange={handleChange}
        tagName="div"
        className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto outline-none text-sm leading-relaxed"
        placeholder={placeholder}
      />
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
    >
      {icon}
    </button>
  );
}
