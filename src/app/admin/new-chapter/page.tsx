'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../types/story';
import Navigation from '../../../component/Navigation';

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
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
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

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storyId || !formData.title || !formData.chapterNumber) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Create a temporary chapter with basic info
      const tempChapter = {
        storyId: formData.storyId,
        title: formData.title,
        chapterNumber: formData.chapterNumber,
        content: '' // Will be filled in the next step
      };
      
      // Store in localStorage for the next step
      localStorage.setItem('tempChapter', JSON.stringify(tempChapter));
      
      // Navigate to content writing page
      router.push(`/admin/new-chapter/content`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                ✨ Tạo Chương Mới
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Bước 1: Nhập thông tin cơ bản
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link 
                href="/admin" 
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                ⬅️ Quay Lại Dashboard
              </Link>
              <Link 
                href="/stories" 
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                👁️ Xem Trang Web
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                🏠 Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-gray-800">
          {error && (
            <div className="mb-6 p-3 sm:p-4 rounded-md bg-red-900/20 text-red-400 border border-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleNext} className="space-y-6">
            {/* Story Selection */}
            <div>
              <label htmlFor="storyId" className="block text-sm font-medium text-gray-300 mb-2">
                Chọn truyện *
              </label>
              <select
                id="storyId"
                name="storyId"
                value={formData.storyId}
                onChange={handleStoryChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white"
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
                <p className="mt-1 text-sm text-red-400">
                  Chưa có truyện nào. Vui lòng <Link href="/admin/new-story" className="text-blue-400 hover:underline">tạo truyện trước</Link>.
                </p>
              )}
            </div>

            {/* Chapter Number - Auto-calculated */}
            <div>
              <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-300 mb-2">
                Số chương * (Tự động tính)
              </label>
              <input
                type="number"
                id="chapterNumber"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white"
                required
                readOnly
              />
            </div>

            {/* Chapter Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Tiêu đề chương *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập tiêu đề chương..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : '➡️ Tiếp Theo'}
              </button>
              <Link
                href="/admin"
                className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center border border-gray-600"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
