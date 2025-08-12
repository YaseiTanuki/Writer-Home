'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../types/story';
import TiptapEditor from '../../../component/TiptapEditor';

export default function NewChapterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  
  const [formData, setFormData] = useState<CreateChapterRequest>({
    storyId: '',
    title: '',
    content: '',
    chapterNumber: 1
  });

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated]);

  const loadStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await storyService.getStories();
      setStories(response.stories);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Auto-calculate chapter number when story is selected
  const handleStoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storyId = e.target.value;
    setFormData(prev => ({ ...prev, storyId }));
    
    if (storyId) {
      try {
        // Get chapters for the selected story to calculate next chapter number
        const chaptersResponse = await storyService.getChapters(storyId);
        const nextChapterNumber = chaptersResponse.chapters.length > 0 
          ? Math.max(...chaptersResponse.chapters.map(c => c.chapterNumber)) + 1
          : 1;
        
        setFormData(prev => ({ ...prev, chapterNumber: nextChapterNumber }));
      } catch (err) {
        console.error('Failed to load chapters:', err);
        // Fallback to chapter 1 if there's an error
        setFormData(prev => ({ ...prev, chapterNumber: 1 }));
      }
    }
  };

  if (isLoading || isLoadingStories) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'chapterNumber') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storyId || !formData.title || !formData.content || !formData.chapterNumber) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await storyService.createChapter(formData);
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo chương');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Tạo Chương Mới</h1>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                ⬅️ Quay Lại Dashboard
              </Link>
              <Link 
                href="/stories" 
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                👁️ Xem Trang Web
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                🏠 Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-100 text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Story Selection */}
            <div>
              <label htmlFor="storyId" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn truyện *
              </label>
              <select
                id="storyId"
                name="storyId"
                value={formData.storyId}
                onChange={handleStoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              >
                <option value="">-- Chọn truyện --</option>
                {stories.map((story) => (
                  <option key={story._id} value={story._id}>
                    {story.title}
                  </option>
                ))}
              </select>
              {stories.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Chưa có truyện nào. Vui lòng <Link href="/admin/new-story" className="text-blue-600 hover:underline">tạo truyện trước</Link>.
                </p>
              )}
            </div>

            {/* Chapter Number - Auto-calculated */}
            <div>
              <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Số chương * (Tự động tính)
              </label>
              <input
                type="number"
                id="chapterNumber"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-gray-50"
                required
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Số chương được tự động tính dựa trên số chương hiện có của truyện
              </p>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề chương *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Nhập tiêu đề chương"
                required
              />
            </div>

            {/* Content with TipTap Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung chương *
              </label>
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Bắt đầu viết nội dung chương của bạn ở đây..."
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Sử dụng thanh công cụ để định dạng văn bản, thêm liên kết, và tùy chỉnh giao diện
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link
                href="/admin"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors duration-200"
              >
                Hủy
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting || stories.length === 0}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo Chương'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
