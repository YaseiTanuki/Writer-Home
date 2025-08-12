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
  Type
} from 'lucide-react';

interface TiptapToolbarProps {
  editor: Editor | null;
}

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
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

  return (
    <div className="border-b border-gray-200 bg-white p-2 flex flex-wrap gap-1 items-center">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Gạch chân (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Gạch ngang"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Tiêu đề 1"
        >
          <Heading1 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Tiêu đề 2"
        >
          <Heading2 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Tiêu đề 3"
        >
          <Heading3 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Đoạn văn"
        >
          <Type size={16} />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Căn trái"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Căn giữa"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Căn phải"
        >
          <AlignRight size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Căn đều"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      {/* Lists and Blocks */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Danh sách không số"
        >
          <List size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Danh sách có số"
        >
          <ListOrdered size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Trích dẫn"
        >
          <Quote size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Khối code"
        >
          <Code size={16} />
        </button>
      </div>

      {/* Links and Styling */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title="Thêm liên kết"
        >
          <Link size={16} />
        </button>
        
        <button
          onClick={removeLink}
          disabled={!editor.isActive('link')}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
          title="Xóa liên kết"
        >
          <Unlink size={16} />
        </button>
        
        <button
          onClick={setTextColor}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="Màu chữ"
        >
          <Palette size={16} />
        </button>
        
        <button
          onClick={setHighlight}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="Highlight văn bản"
        >
          <Highlighter size={16} />
        </button>
      </div>

      {/* Clear Formatting */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="Xóa định dạng"
        >
          <span className="text-xs font-medium">Xóa định dạng</span>
        </button>
      </div>
    </div>
  );
}
