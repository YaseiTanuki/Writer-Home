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
  
  // Input modal states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [textColor, setTextColor] = useState('');
  const [highlightColor, setHighlightColor] = useState('');
  
  if (!editor) {
    return null;
  }

  const addLink = () => {
    setShowLinkModal(true);
  };

  const confirmAddLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const cancelAddLink = () => {
    setLinkUrl('');
    setShowLinkModal(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const openTextColorModal = () => {
    setShowColorModal(true);
  };

  const confirmSetTextColor = () => {
    if (textColor.trim()) {
      editor.chain().focus().setColor(textColor.trim()).run();
      setTextColor('');
      setShowColorModal(false);
    }
  };

  const cancelSetTextColor = () => {
    setTextColor('');
    setShowColorModal(false);
  };

  const openHighlightModal = () => {
    setShowHighlightModal(true);
  };

  const confirmSetHighlight = () => {
    if (highlightColor.trim()) {
      editor.chain().focus().setHighlight({ color: highlightColor.trim() }).run();
      setHighlightColor('');
      setShowHighlightModal(false);
    }
  };

  const cancelSetHighlight = () => {
    setHighlightColor('');
    setShowHighlightModal(false);
  };

  // All features in a single array
  const allFeatures = [
    {
      icon: <Bold size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleBold().run();
      },
      canExecute: editor.can().chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'In đậm (Ctrl+B)'
    },
    {
      icon: <Italic size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleItalic().run();
      },
      canExecute: editor.can().chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'In nghiêng (Ctrl+I)'
    },
    {
      icon: <Underline size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleUnderline().run();
      },
      canExecute: editor.can().chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Gạch chân (Ctrl+U)'
    },
    {
      icon: <Strikethrough size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleStrike().run();
      },
      canExecute: editor.can().chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Gạch ngang'
    },
    {
      icon: <Heading1 size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
      canExecute: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Tiêu đề 1'
    },
    {
      icon: <Heading2 size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
      canExecute: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Tiêu đề 2'
    },
    {
      icon: <Heading3 size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      },
      canExecute: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Tiêu đề 3'
    },
    {
      icon: <List size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleBulletList().run();
      },
      canExecute: editor.can().chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Danh sách không thứ tự'
    },
    {
      icon: <ListOrdered size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleOrderedList().run();
      },
      canExecute: editor.can().chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Danh sách có thứ tự'
    },
    {
      icon: <Quote size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleBlockquote().run();
      },
      canExecute: editor.can().chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Trích dẫn'
    },
    {
      icon: <Code size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleCodeBlock().run();
      },
      canExecute: editor.can().chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Khối mã'
    },
    {
      icon: <Link size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addLink();
      },
      canExecute: true,
      isActive: editor.isActive('link'),
      title: 'Thêm liên kết'
    },
    {
      icon: <Unlink size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeLink();
      },
      canExecute: editor.can().chain().focus().unsetLink().run(),
      isActive: false,
      title: 'Xóa liên kết'
    },
    {
      icon: <AlignLeft size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().setTextAlign('left').run();
      },
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'left' }),
      title: 'Căn trái'
    },
    {
      icon: <AlignCenter size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().setTextAlign('center').run();
      },
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'center' }),
      title: 'Căn giữa'
    },
    {
      icon: <AlignRight size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().setTextAlign('right').run();
      },
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'right' }),
      title: 'Căn phải'
    },
    {
      icon: <AlignJustify size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().setTextAlign('justify').run();
      },
      canExecute: true,
      isActive: editor.isActive({ textAlign: 'justify' }),
      title: 'Căn đều'
    },
    {
      icon: <Palette size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openTextColorModal();
      },
      canExecute: true,
      isActive: false,
      title: 'Màu chữ'
    },
    {
      icon: <Highlighter size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openHighlightModal();
      },
      canExecute: true,
      isActive: false,
      title: 'Highlight văn bản'
    },
    {
      icon: <Type size={14} className="sm:w-4 sm:h-4" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().clearNodes().unsetAllMarks().run();
      },
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
          type="button"
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
            type="button"
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
          type="button"
          onClick={nextPage}
          disabled={totalPages <= 1}
          className="p-1.5 sm:p-2 rounded hover:bg-gray-700 transition-colors text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trang sau"
        >
          <ChevronRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
      
      {/* Link Input Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/20 mb-4">
                <Link size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white text-center mb-2">
                Thêm liên kết
              </h3>
              <div className="space-y-4">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Nhập URL (ví dụ: https://example.com)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && confirmAddLink()}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelAddLink}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={confirmAddLink}
                    disabled={!linkUrl.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Color Input Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-900/20 mb-4">
                <Palette size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white text-center mb-2">
                Đặt màu chữ
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="Nhập mã màu (ví dụ: #ff0000)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && confirmSetTextColor()}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelSetTextColor}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={confirmSetTextColor}
                    disabled={!textColor.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Highlight Color Input Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/20 mb-4">
                <Highlighter size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-white text-center mb-2">
                Đặt màu highlight
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  placeholder="Nhập mã màu (ví dụ: #ffff00)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && confirmSetHighlight()}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelSetHighlight}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={confirmSetHighlight}
                    disabled={!highlightColor.trim()}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
