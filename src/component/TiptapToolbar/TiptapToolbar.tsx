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
      icon: <Bold size={16} />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      canExecute: editor.can().chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'In đậm (Ctrl+B)'
    },
    {
      icon: <Italic size={16} />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      canExecute: editor.can().chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'In nghiêng (Ctrl+I)'
    },
    {
      icon: <Underline size={16} />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      canExecute: editor.can().chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Gạch chân (Ctrl+U)'
    },
    {
      icon: <Strikethrough size={16} />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      canExecute: editor.can().chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Gạch ngang'
    },
    {
      icon: <Heading1 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Tiêu đề 1'
    },
    {
      icon: <Heading2 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Tiêu đề 2'
    },
    {
      icon: <Heading3 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      canExecute: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Tiêu đề 3'
    },
    {
      icon: <AlignLeft size={16} />,
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
      canExecute: editor.can().chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      title: 'Căn trái'
    },
    {
      icon: <AlignCenter size={16} />,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
      canExecute: editor.can().chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
      title: 'Căn giữa'
    },
    {
      icon: <AlignRight size={16} />,
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
      canExecute: editor.can().chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      title: 'Căn phải'
    },
    {
      icon: <AlignJustify size={16} />,
      onClick: () => editor.chain().focus().setTextAlign('justify').run(),
      canExecute: editor.can().chain().focus().setTextAlign('justify').run(),
      isActive: editor.isActive({ textAlign: 'justify' }),
      title: 'Căn đều'
    },
    {
      icon: <List size={16} />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      canExecute: true,
      isActive: editor.isActive('bulletList'),
      title: 'Danh sách không số'
    },
    {
      icon: <ListOrdered size={16} />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      canExecute: true,
      isActive: editor.isActive('orderedList'),
      title: 'Danh sách có số'
    },
    {
      icon: <Quote size={16} />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      canExecute: true,
      isActive: editor.isActive('blockquote'),
      title: 'Trích dẫn'
    },
    {
      icon: <Code size={16} />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      canExecute: true,
      isActive: editor.isActive('codeBlock'),
      title: 'Khối code'
    },
    {
      icon: <span className="text-xs font-medium border-t-2 border-gray-400 w-6 h-4 flex items-center justify-center">─</span>,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      canExecute: true,
      isActive: false,
      title: 'Kẻ hàng ngang'
    },
    {
      icon: <Link size={16} />,
      onClick: addLink,
      canExecute: true,
      isActive: editor.isActive('link'),
      title: 'Thêm liên kết'
    },
    {
      icon: <Unlink size={16} />,
      onClick: removeLink,
      canExecute: editor.isActive('link'),
      isActive: false,
      title: 'Xóa liên kết'
    },
    {
      icon: <Palette size={16} />,
      onClick: setTextColor,
      canExecute: true,
      isActive: false,
      title: 'Màu chữ'
    },
    {
      icon: <Highlighter size={16} />,
      onClick: setHighlight,
      canExecute: true,
      isActive: false,
      title: 'Highlight văn bản'
    },
    {
      icon: <Type size={16} />,
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
    <div className="border-b border-gray-200 bg-white p-2" ref={containerRef}>
      {/* Features Container with Navigation */}
      <div className="flex items-center gap-1 justify-center">
        {/* Previous Page Button */}
        <button
          onClick={prevPage}
          disabled={totalPages <= 1}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Features */}
        {currentFeatures.map((feature, index) => (
          <button
            key={startIndex + index}
            onClick={feature.onClick}
            disabled={!feature.canExecute}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              feature.isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
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
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
