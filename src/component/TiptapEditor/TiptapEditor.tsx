'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
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
          class: 'text-pink-600 underline cursor-pointer',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      HorizontalRule,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Preserve scroll position
      const scrollPos = window.scrollY;
      onChange(editor.getHTML());
      // Restore scroll position after a brief delay
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
      }, 0);
    },
    editorProps: {
      attributes: {
        class: 'mx-auto focus:outline-none',
      },
      handleDOMEvents: {
        // Prevent automatic scrolling when focusing
        focus: (view, event) => {
          // Don't scroll to focused element
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  const wordCount = editor ? editor.getText().split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = editor ? editor.getText().length : 0;

  if (!isMounted) {
    return (
      <div className={`border border-gray-600 rounded-md overflow-hidden ${className}`}>
        <div className="p-2 sm:p-3 md:p-4 text-center text-gray-400 text-xs sm:text-sm">
          Đang tải trình soạn thảo...
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <TiptapToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] p-0 sm:p-3 md:p-4 focus:outline-none max-w-none bg-gray-900 text-white"
        style={{
          minHeight: '300px',
          padding: '0', // No padding on mobile
          backgroundColor: '#111827',
          color: '#ffffff',
          fontSize: '12px', // Force mobile font size
        }}
      />
      
      {/* Custom styles with higher specificity */}
      <style jsx global>{`
        /* Override Tiptap default styles with maximum specificity */
        .ProseMirror,
        .ProseMirror *,
        .ProseMirror p,
        .ProseMirror div,
        .ProseMirror span {
          font-size: 12px !important; /* Force 12px on mobile */
          line-height: 1.25rem !important;
        }
        
        @media (min-width: 640px) {
          .ProseMirror,
          .ProseMirror *,
          .ProseMirror p,
          .ProseMirror div,
          .ProseMirror span {
            font-size: 10px !important; /* Force 10px on tablet */
            line-height: 1.5rem !important;
          }
        }
        
        @media (min-width: 768px) {
          .ProseMirror,
          .ProseMirror *,
          .ProseMirror p,
          .ProseMirror div,
          .ProseMirror span {
            font-size: 12px !important; /* Force 12px on desktop */
            line-height: 1.75rem !important;
          }
        }
        
        /* Headings with higher specificity */
        .ProseMirror h1,
        .ProseMirror h1 * {
          font-size: 14px !important; /* Mobile */
          line-height: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          font-weight: bold !important;
        }
        
        @media (min-width: 640px) {
          .ProseMirror h1,
          .ProseMirror h1 * {
            font-size: 16px !important; /* Tablet */
            line-height: 1.75rem !important;
            margin-bottom: 1rem !important;
          }
        }
        
        @media (min-width: 768px) {
          .ProseMirror h1,
          .ProseMirror h1 * {
            font-size: 18px !important; /* Desktop */
            line-height: 2rem !important;
            margin-bottom: 1.25rem !important;
          }
        }
        
        .ProseMirror h2,
        .ProseMirror h2 * {
          font-size: 12px !important; /* Mobile */
          line-height: 1.5rem !important;
          margin-bottom: 0.75rem !important;
          font-weight: bold !important;
        }
        
        @media (min-width: 640px) {
          .ProseMirror h2,
          .ProseMirror h2 * {
            font-size: 14px !important; /* Tablet */
            line-height: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
        }
        
        @media (min-width: 768px) {
          .ProseMirror h2,
          .ProseMirror h2 * {
            font-size: 16px !important; /* Desktop */
            line-height: 1.75rem !important;
            margin-bottom: 1.25rem !important;
          }
        }
        
        .ProseMirror h3,
        .ProseMirror h3 * {
          font-size: 10px !important; /* Mobile */
          line-height: 1.25rem !important;
          margin-bottom: 0.5rem !important;
          font-weight: bold !important;
        }
        
        @media (min-width: 640px) {
          .ProseMirror h3,
          .ProseMirror h3 * {
            font-size: 12px !important; /* Tablet */
            line-height: 1.5rem !important;
            margin-bottom: 0.75rem !important;
          }
        }
        
        @media (min-width: 768px) {
          .ProseMirror h3,
          .ProseMirror h3 * {
            font-size: 14px !important; /* Desktop */
            line-height: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
        }
        
        /* Horizontal rule */
        .ProseMirror hr {
          border: none !important;
          border-top: 2px solid #4b5563 !important;
          margin: 1rem 0 !important; /* mobile */
          width: 100% !important;
        }
        
        @media (min-width: 640px) {
          .ProseMirror hr {
            margin: 1.25rem 0 !important; /* sm */
          }
        }
        
        @media (min-width: 768px) {
          .ProseMirror hr {
            margin: 1.5rem 0 !important; /* md */
          }
        }
        
        .ProseMirror hr:hover {
          border-top-color: #6b7280 !important;
        }
      `}</style>
      
      {/* Word and Character Count */}
      <div className="border-t border-gray-800 bg-gray-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-300 flex justify-between">
        <span>Từ: {wordCount}</span>
        <span>Ký tự: {charCount}</span>
      </div>
    </div>
  );
}
