'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TiptapToolbar from '../TiptapToolbar';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  placeholder,
  className = ''
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  const wordCount = editor ? editor.getText().split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = editor ? editor.getText().length : 0;

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
        <div className="p-4 text-center text-gray-500">
          Đang tải trình soạn thảo...
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <TiptapToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{
          minHeight: '400px',
          padding: '1rem',
        }}
      />
      
      {/* Word and Character Count */}
      <div className="border-t border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 flex justify-between">
        <span>Từ: {wordCount}</span>
        <span>Ký tự: {charCount}</span>
      </div>
    </div>
  );
}
