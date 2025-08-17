'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../types/story';
import Navigation from '../../../component/Navigation';
import { Sparkles, BookOpen, Home, Plus, ArrowLeft } from 'lucide-react';

export default function NewChapterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CreateChapterRequest>({
    title: '',
    storyId: '',
    content: '',
    chapterNumber: 1
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

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
    setTouched(prev => ({ ...prev, storyId: true }));
    
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
        <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={80}
                height={80}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    
    switch (fieldName) {
      case 'title':
        return !formData.title ? 'Tiêu đề không được để trống' : null;
      case 'storyId':
        return !formData.storyId ? 'Vui lòng chọn truyện' : null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      title: true,
      storyId: true
    });
    
    if (!formData.title || !formData.storyId) {
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
      <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <div className="relative mb-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  <Sparkles size={20} className="text-blue-400 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  Tạo Chương Mới
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">
                  Thêm chương mới vào truyện
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-md bg-red-900/20 border border-red-700/50 text-red-300 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Story Selection */}
            <div className="bg-gray-900/50 rounded-md border border-gray-700 p-3 sm:p-4 backdrop-blur-sm">
              <label htmlFor="storyId" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Chọn truyện *
              </label>
              <select
                id="storyId"
                name="storyId"
                value={formData.storyId}
                onChange={handleStoryChange}
                onBlur={() => handleBlur('storyId')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-800/50 text-white backdrop-blur-sm transition-all duration-200"
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
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-yellow-300">
                      Chưa có truyện nào. Vui lòng <Link href="/admin/new-story" className="text-blue-400 hover:underline">tạo truyện trước</Link>.
                    </p>
                  </div>
                </div>
              )}
              {getFieldError('storyId') && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-red-300">{getFieldError('storyId')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter Number - Auto-calculated */}
            <div className="bg-gray-900/50 rounded-md border border-gray-700 p-3 sm:p-4 backdrop-blur-sm">
              <label htmlFor="chapterNumber" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Số chương * (Tự động tính)
              </label>
              <input
                type="number"
                id="chapterNumber"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-800/50 text-white backdrop-blur-sm transition-all duration-200"
                required
                readOnly
              />
            </div>

            {/* Chapter Title */}
            <div className="bg-gray-900/50 rounded-md border border-gray-700 p-3 sm:p-4 backdrop-blur-sm">
              <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Tiêu đề chương *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={() => handleBlur('title')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-gray-800/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                placeholder="Nhập tiêu đề chương..."
                required
              />
              {getFieldError('title') && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded-md backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <p className="text-xs sm:text-sm text-red-300">{getFieldError('title')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                      <Image
                        src="/reading.gif"
                        alt="Creating..."
                        width={20}
                        height={20}
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm sm:text-base">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Tạo Chương</span>
                  </>
                )}
              </button>
              <Link
                href="/admin"
                className="flex-1 sm:flex-none bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium transition-all duration-300 text-center text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-105"
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
