'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Unlink,
  Highlighter,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  Type,
} from 'lucide-react';
import { useState } from 'react';

interface TiptapToolbarProps {
  editor: Editor | null;
}

const TEXT_COLORS = ['#cdd6f4', '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#89dceb', '#89b4fa', '#cba6f7', '#f5c2e7'];
const HIGHLIGHT_COLORS = ['#f9e2af', '#f38ba8', '#fab387', '#a6e3a1', '#89b4fa', '#cba6f7', '#f5c2e7', '#45475a'];

function Btn({
  onClick, active, disabled, title, children,
}: {
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(e); }}
      disabled={disabled}
      title={title}
      className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: active ? 'rgba(203,166,247,0.2)' : 'transparent',
        color: active ? '#cba6f7' : '#a6adc8',
        border: active ? '1px solid rgba(203,166,247,0.4)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="flex-shrink-0 w-px h-5 mx-0.5" style={{ backgroundColor: '#45475a' }} />;
}

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [textColor, setTextColor] = useState('');
  const [highlightColor, setHighlightColor] = useState('');

  if (!editor) return null;

  const confirmAddLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const confirmSetTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setTextColor('');
    setShowColorModal(false);
  };

  const confirmSetHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setHighlightColor('');
    setShowHighlightModal(false);
  };

  return (
    <>
      <div
        className="border-b flex items-center px-1.5 py-1 gap-0.5 overflow-x-auto"
        style={{
          backgroundColor: '#1e1e2e',
          borderColor: '#45475a',
          scrollbarWidth: 'none',
        }}
      >
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In dam (Ctrl+B)">
          <Bold size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghieng (Ctrl+I)">
          <Italic size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gach chan (Ctrl+U)">
          <Underline size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gach ngang">
          <Strikethrough size={15} />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tieu de 1">
          <Heading1 size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tieu de 2">
          <Heading2 size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tieu de 3">
          <Heading3 size={15} />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sach">
          <List size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sach so">
          <ListOrdered size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trich dan">
          <Quote size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Khoi ma">
          <Code size={15} />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Can trai">
          <AlignLeft size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Can giua">
          <AlignCenter size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Can phai">
          <AlignRight size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Can deu">
          <AlignJustify size={15} />
        </Btn>
        <Sep />
        <Btn onClick={() => setShowLinkModal(true)} active={editor.isActive('link')} title="Them lien ket">
          <Link size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} active={false} disabled={!editor.isActive('link')} title="Xoa lien ket">
          <Unlink size={15} />
        </Btn>
        <Sep />
        <Btn onClick={() => setShowColorModal(true)} active={false} title="Mau chu">
          <Palette size={15} />
        </Btn>
        <Btn onClick={() => setShowHighlightModal(true)} active={false} title="Highlight">
          <Highlighter size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} active={false} title="Xoa dinh dang">
          <Type size={15} />
        </Btn>
      </div>

      {showLinkModal && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(17,17,27,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a' }}>
            <div className="flex items-center gap-2">
              <Link size={16} style={{ color: '#89b4fa' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Them lien ket</h3>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ backgroundColor: '#313244', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAddLink(); if (e.key === 'Escape') setShowLinkModal(false); }}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: '#313244', color: '#a6adc8', border: '1px solid #45475a' }}>Huy</button>
              <button type="button" onClick={confirmAddLink} disabled={!linkUrl.trim()} className="flex-1 py-2 rounded-xl text-xs font-semibold disabled:opacity-40" style={{ backgroundColor: '#89b4fa', color: '#11111b' }}>Them</button>
            </div>
          </div>
        </div>
      )}

      {showColorModal && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(17,17,27,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a' }}>
            <div className="flex items-center gap-2">
              <Palette size={16} style={{ color: '#f5c2e7' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Mau chu</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => confirmSetTextColor(c)} className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95" style={{ backgroundColor: c, borderColor: 'transparent' }} title={c} />
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="#hex" className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ backgroundColor: '#313244', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }} />
              <button type="button" onClick={() => confirmSetTextColor(textColor)} disabled={!textColor.trim()} className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40" style={{ backgroundColor: '#cba6f7', color: '#11111b' }}>OK</button>
            </div>
            <button type="button" onClick={() => setShowColorModal(false)} className="w-full py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: '#313244', color: '#a6adc8', border: '1px solid #45475a' }}>Dong</button>
          </div>
        </div>
      )}

      {showHighlightModal && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(17,17,27,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#1e1e2e', border: '1px solid #45475a' }}>
            <div className="flex items-center gap-2">
              <Highlighter size={16} style={{ color: '#f9e2af' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Mau highlight</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => confirmSetHighlight(c)} className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95" style={{ backgroundColor: c, borderColor: 'transparent' }} title={c} />
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} placeholder="#hex" className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ backgroundColor: '#313244', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }} />
              <button type="button" onClick={() => confirmSetHighlight(highlightColor)} disabled={!highlightColor.trim()} className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40" style={{ backgroundColor: '#f9e2af', color: '#11111b' }}>OK</button>
            </div>
            <button type="button" onClick={() => setShowHighlightModal(false)} className="w-full py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: '#313244', color: '#a6adc8', border: '1px solid #45475a' }}>Dong</button>
          </div>
        </div>
      )}
    </>
  );
}