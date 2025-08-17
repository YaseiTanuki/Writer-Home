'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../../contexts/AuthContext';
import { storyService } from '../../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../../types/story';
import TiptapEditor from '../../../../component/TiptapEditor';
import Navigation from '../../../../component/Navigation';
import { Sparkles, BookOpen, Home, Plus, X, FileText } from 'lucide-react';

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
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
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

  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    
    switch (fieldName) {
      case 'content':
        return !content.trim() ? 'Nội dung không được để trống' : null;
      default:
        return null;
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
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
      </div>
    );
  }

  if (!tempChapter || !story) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 lg:pt-32">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-4 flex items-center justify-center gap-2">
                <X size={24} />
                Dữ liệu không hợp lệ
              </div>
              <p className="mt-4 text-gray-300 mb-6">Không thể tải thông tin chương. Vui lòng thử lại.</p>
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
    
    // Mark content field as touched to show errors
    setTouched({ content: true });
    
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
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 lg:pt-32">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-3">
                <Sparkles size={28} className="text-blue-400" />
                Viết Nội Dung Chương
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Bước 2: Viết nội dung chương
              </p>
            </div>
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <Link 
                href="/stories" 
                className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                <BookOpen size={16} />
                Xem Trang Web
              </Link>
              <Link 
                href="/admin" 
                className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                <Home size={16} />
                Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Chapter Info */}
        <div className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4 flex items-center gap-2">
            <FileText size={18} className="sm:w-5 sm:h-5" />
            Thông Tin Chương
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Truyện:</label>
              <p className="text-xs sm:text-sm text-white font-medium">{story.title}</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Số chương:</label>
              <p className="text-xs sm:text-sm text-white font-medium">{tempChapter.chapterNumber}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Tiêu đề chương:</label>
              <p className="text-xs sm:text-sm text-white font-medium">{tempChapter.title}</p>
            </div>
          </div>
        </div>

        {/* Chapter Content - Full Width on Mobile */}
        <div className="px-0 sm:px-3 lg:px-8">
          <div className="bg-gray-900 shadow border border-gray-800">
            <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Nội dung chương *
              </label>
            </div>
            <div className="w-full">
              <TiptapEditor
                content={content}
                onChange={(newContent) => {
                  setContent(newContent);
                  setTouched(prev => ({ ...prev, content: true }));
                }}
              />
            </div>
            {getFieldError('content') && (
              <div className="px-2 sm:px-3 md:px-4 lg:px-6 pb-3">
                <p className="text-red-300 text-xs">{getFieldError('content')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="p-3 sm:p-4 md:p-6">
            {error && (
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 rounded-md bg-red-900/20 text-red-400 border border-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
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
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors duration-200 border border-gray-600 text-sm sm:text-base"
                >
                  ⬅️ Quay Lại
                </button>
                <Link
                  href="/admin"
                  className="flex-1 sm:flex-none bg-red-900/20 hover:bg-red-800/20 text-red-400 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium transition-colors duration-200 text-center border border-red-700 text-sm sm:text-base"
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
