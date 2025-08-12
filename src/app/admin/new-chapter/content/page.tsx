'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { storyService } from '../../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../../types/story';
import TiptapEditor from '../../../../component/TiptapEditor';
import Navigation from '../../../../component/Navigation';

interface TempChapter {
  storyId: string;
  title: string;
  chapterNumber: number;
  content: string;
}

export default function ChapterContentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tempChapter, setTempChapter] = useState<TempChapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [content, setContent] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadTempChapter();
    }
  }, [isAuthenticated]);

  const loadTempChapter = async () => {
    try {
      setIsLoadingData(true);
      
      // Get temp chapter data from localStorage
      const tempChapterData = localStorage.getItem('tempChapter');
      if (!tempChapterData) {
        router.push('/admin/new-chapter');
        return;
      }

      const parsedTempChapter: TempChapter = JSON.parse(tempChapterData);
      setTempChapter(parsedTempChapter);
      setContent(parsedTempChapter.content || '');

      // Load story information
      const storyResponse = await storyService.getStory(parsedTempChapter.storyId);
      setStory(storyResponse.story);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 lg:pt-32">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tempChapter || !story) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 lg:pt-32">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-4">❌ Dữ liệu không hợp lệ</div>
              <p className="text-gray-600 mb-6">Không thể tải thông tin chương. Vui lòng thử lại.</p>
              <Link
                href="/admin/new-chapter"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung chương');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const chapterData: CreateChapterRequest = {
        storyId: tempChapter.storyId,
        title: tempChapter.title,
        chapterNumber: tempChapter.chapterNumber,
        content: content
      };
      
      await storyService.createChapter(chapterData);
      
      // Clear temp data
      localStorage.removeItem('tempChapter');
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo chương');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Update temp chapter with current content
    const updatedTempChapter = { ...tempChapter, content };
    localStorage.setItem('tempChapter', JSON.stringify(updatedTempChapter));
    router.push('/admin/new-chapter');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 lg:pt-32">
        {/* Page Title */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  ✨ Viết Nội Dung Chương
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Bước 2: Viết nội dung chương
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link 
                  href="/admin" 
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
                >
                  ⬅️ Quay Lại Dashboard
                </Link>
                <Link 
                  href="/stories" 
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
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
        </div>

        {/* Basic Information Display */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📖 Thông Tin Chương</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Truyện:</label>
                <p className="text-sm text-gray-900 font-medium">{story.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Số chương:</label>
                <p className="text-sm text-gray-900 font-medium">{tempChapter.chapterNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tiêu đề chương:</label>
                <p className="text-sm text-gray-900 font-medium">{tempChapter.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Content - Full Width on Mobile */}
        <div className="px-0 sm:px-3 lg:px-8">
          <div className="bg-white shadow">
            <div className="px-3 sm:px-4 lg:px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung chương *
              </label>
            </div>
            <div className="w-full">
              <TiptapEditor
                content={content}
                onChange={setContent}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
            {error && (
              <div className="mb-6 p-3 sm:p-4 rounded-md bg-red-100 text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang tạo...' : '✨ Tạo Chương'}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  ⬅️ Quay Lại
                </button>
                <Link
                  href="/admin"
                  className="flex-1 sm:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
                >
                  Hủy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
