'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../../../contexts/AuthContext';
import { storyService } from '../../../../../services/storyService';
import { Chapter, UpdateChapterRequest } from '../../../../../types/story';
import TiptapEditor from '../../../../../component/TiptapEditor';
import Navigation from '../../../../../component/Navigation';
import { Edit3, ArrowLeft } from 'lucide-react';

export default function EditChapterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState(true);
  const [error, setError] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  
  const [formData, setFormData] = useState<UpdateChapterRequest>({
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
    if (isAuthenticated && chapterId) {
      loadChapter();
    }
  }, [isAuthenticated, chapterId]);

  const loadChapter = async () => {
    try {
      setIsLoadingChapter(true);
      const response = await storyService.getChapter(chapterId);
      setChapter(response.chapter);
      setFormData({
        title: response.chapter.title,
        content: response.chapter.content,
        chapterNumber: response.chapter.chapterNumber
      });
    } catch (err) {
      setError('Không thể tải thông tin chương');
      console.error('Failed to load chapter:', err);
    } finally {
      setIsLoadingChapter(false);
    }
  };

  if (isLoading || isLoadingChapter) {
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

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-400">Không tìm thấy chương</p>
            <Link href="/admin" className="text-blue-400 hover:text-blue-300 mt-4 block">
              Quay lại trang quản lý
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'chapterNumber') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.chapterNumber) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await storyService.updateChapter(chapterId, formData);
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật chương');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Page Title */}
      <div className="mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-2 sm:gap-3">
              <Edit3 size={24} className="text-blue-400 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              Chỉnh Sửa Chương
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-300">
               Cập nhật thông tin chương
            </p>
          </div>
          
        </div>
      </div>

      {/* Form Container */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        {error && (
          <div className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 rounded-md bg-red-900/20 border border-red-700 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Chapter Number */}
          <div>
            <label htmlFor="chapterNumber" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
              Số chương *
            </label>
            <input
              type="number"
              id="chapterNumber"
              name="chapterNumber"
              value={formData.chapterNumber}
              onChange={handleInputChange}
              min="1"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm md:text-base bg-gray-800 text-white"
              required
            />
          </div>

          {/* Chapter Title */}
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
              Tiêu đề chương *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm md:text-base bg-gray-800 text-white placeholder-gray-400"
              placeholder="Nhập tiêu đề chương..."
              required
            />
          </div>
        </form>
      </div>

      {/* Chapter Content - Full Width */}
      <div className="px-0 sm:px-3 lg:px-8 mb-6">
        <div className="bg-gray-900 shadow border border-gray-800">
          <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Nội dung chương *
            </label>
          </div>
          <div className="w-full">
            <TiptapEditor
              content={formData.content || ''}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Viết nội dung chương..."
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                  <Image
                    src="/reading.gif"
                    alt="Updating..."
                    width={20}
                    height={20}
                    className="rounded w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm sm:text-base">Đang cập nhật...</span>
              </>
            ) : (
              <>
                <Edit3 size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Cập Nhật Chương</span>
              </>
            )}
          </button>
          <Link
            href="/admin"
            className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors duration-200 text-center text-sm sm:text-base"
          >
            Hủy
          </Link>
        </div>
      </div>
    </div>
  );
}
