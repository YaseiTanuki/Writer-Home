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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TiptapToolbarProps {
  editor: Editor | null;
}

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [featuresPerPage, setFeaturesPerPage] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const setTextColor = () => {
    const color = window.prompt('Nhập mã màu (ví dụ: #ff0000):');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlight = () => {
    const color = window.prompt('Nhập mã màu highlight (ví dụ: #ffff00):');
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  // All features in a single array
  const allFeatures = [
    {
      icon: <Bold size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      canExecute: editor.can().chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'In đậm (Ctrl+B)'
    },
    {
      icon: <Italic size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      canExecute: editor.can().chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'In nghiêng (Ctrl+I)'
    },
    {
      icon: <Underline size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      canExecute: editor.can().chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Gạch chân (Ctrl+U)'
    },
    {
      icon: <Strikethrough size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      canExecute: editor.can().chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Gạch ngang'
    },
    {
      icon: <Heading1 size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Tiêu đề 1'
    },
    {
      icon: <Heading2 size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Tiêu đề 2'
    },
    {
      icon: <Heading3 size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Tiêu đề 3'
    },
    {
      icon: <List size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      canExecute: editor.can().chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Danh sách không thứ tự'
    },
    {
      icon: <ListOrdered size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      canExecute: editor.can().chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Danh sách có thứ tự'
    },
    {
      icon: <Quote size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      canExecute: editor.can().chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Trích dẫn'
    },
    {
      icon: <Code size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      canExecute: editor.can().chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Khối mã'
    },
    {
      icon: <Link size={14} className="sm:w-4 sm:h-4" />,
      onClick: addLink,
      canExecute: true,
      isActive: editor.isActive('link'),
      title: 'Thêm liên kết'
    },
    {
      icon: <Unlink size={14} className="sm:w-4 sm:h-4" />,
      onClick: removeLink,
      canExecute: editor.can().chain().focus().unsetLink().run(),
      isActive: false,
      title: 'Xóa liên kết'
    },
    {
      icon: <AlignLeft size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'left' }),
      title: 'Căn trái'
    },
    {
      icon: <AlignCenter size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'center' }),
      title: 'Căn giữa'
    },
    {
      icon: <AlignRight size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'right' }),
      title: 'Căn phải'
    },
    {
      icon: <AlignJustify size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().setTextAlign('justify').run(),
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'justify' }),
      title: 'Căn đều'
    },
    {
      icon: <Palette size={14} className="sm:w-4 sm:h-4" />,
      onClick: setTextColor,
      canExecute: true,
      isActive: false,
      title: 'Màu chữ'
    },
    {
      icon: <Highlighter size={14} className="sm:w-4 sm:h-4" />,
      onClick: setHighlight,
      canExecute: true,
      isActive: false,
      title: 'Highlight văn bản'
    },
    {
      icon: <Type size={14} className="sm:w-4 sm:h-4" />,
      onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      canExecute: true,
      isActive: false,
      title: 'Xóa định dạng'
    }
  ];

  // Calculate features per page based on container width
  useEffect(() => {
    const calculateFeaturesPerPage = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const buttonWidth = 40; // Approximate button width (32px + padding)
        const gap = 4; // Gap between buttons
        const navigationWidth = 120; // Width for navigation arrows and page indicator
        
        const availableWidth = containerWidth - navigationWidth;
        const calculatedFeatures = Math.floor(availableWidth / (buttonWidth + gap));
        
        // Ensure at least 7 features and at most 11 features per page (increased by 3)
        const clampedFeatures = Math.max(7, Math.min(11, calculatedFeatures));
        setFeaturesPerPage(clampedFeatures);
      }
    };

    calculateFeaturesPerPage();
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateFeaturesPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(allFeatures.length / featuresPerPage);
  const startIndex = currentPage * featuresPerPage;
  const endIndex = startIndex + featuresPerPage;
  const currentFeatures = allFeatures.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Reset to first page when features per page changes
  useEffect(() => {
    setCurrentPage(0);
  }, [featuresPerPage]);

  return (
    <div className="border-b border-gray-800 bg-gray-800 p-1.5 sm:p-2" ref={containerRef}>
      {/* Features Container with Navigation */}
      <div className="flex items-center gap-0.5 sm:gap-1 justify-center">
        {/* Previous Page Button */}
        <button
          onClick={prevPage}
          disabled={totalPages <= 1}
          className="p-1.5 sm:p-2 rounded hover:bg-gray-700 transition-colors text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trang trước"
        >
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
        </button>

        {/* Features */}
        {currentFeatures.map((feature, index) => (
          <button
            key={startIndex + index}
            onClick={feature.onClick}
            disabled={!feature.canExecute}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-700 transition-colors ${
              feature.isActive ? 'bg-blue-900/20 text-blue-400 border border-blue-700' : 'text-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={feature.title}
          >
            {feature.icon}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          onClick={nextPage}
          disabled={totalPages <= 1}
          className="p-1.5 sm:p-2 rounded hover:bg-gray-700 transition-colors text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trang sau"
        >
          <ChevronRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
