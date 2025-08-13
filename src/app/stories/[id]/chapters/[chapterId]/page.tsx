'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, ChevronLeft, ChevronRight, Home, BookOpen, List, Minus, Plus, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { storyService } from '../../../../../services/storyService';
import { Story, Chapter } from '../../../../../types/story';
import Navigation from '../../../../../component/Navigation';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  const chapterId = params.chapterId as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);

  useEffect(() => {
    if (storyId && chapterId) {
      loadChapterData();
    }
  }, [storyId, chapterId]);

  const loadChapterData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [storyResponse, chaptersResponse, chapterResponse] = await Promise.all([
        storyService.getStory(storyId),
        storyService.getChapters(storyId),
        storyService.getChapter(chapterId)
      ]);
      
      setStory(storyResponse.story);
      setChapters(chaptersResponse.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber));
      setChapter(chapterResponse.chapter);
    } catch (err) {
      console.error('Failed to load chapter data:', err);
      setError('Không thể tải nội dung chương');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(c => c._id === chapterId);
  };

  const getPreviousChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    return currentIndex > 0 ? chapters[currentIndex - 1] : null;
  };

  const getNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    return currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  };

  const navigateToChapter = (targetChapterId: string) => {
    router.push(`/stories/${storyId}/chapters/${targetChapterId}`);
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const increaseLineHeight = () => setLineHeight(prev => Math.min(prev + 0.1, 2.0));
  const decreaseLineHeight = () => setLineHeight(prev => Math.max(prev - 0.1, 1.2));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story || !chapter) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              {error || 'Không tìm thấy chương'}
            </div>
            <button 
              onClick={() => router.push(`/stories/${storyId}`)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Quay lại truyện
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (story.status !== 'public') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 px-4 py-3 rounded">
              Truyện này chưa được xuất bản
            </div>
            <button 
              onClick={() => router.push('/stories')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const previousChapter = getPreviousChapter();
  const nextChapter = getNextChapter();

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Chapter Header */}
        <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-800">
          <div className="text-center mb-3 sm:mb-4 lg:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
              Chương {chapter.chapterNumber}: {chapter.title}
            </h1>
            <div className="text-gray-300 text-xs sm:text-sm lg:text-base">
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
              </span>
              {chapter.content && (
                <>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <FileText size={14} />
                    {Math.ceil(chapter.content.length / 1000)} nghìn từ
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 border-t border-gray-800 gap-2 sm:gap-3">
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center transition-colors duration-200"
              >
                <ChevronLeft size={16} />
                Chương {previousChapter.chapterNumber}
              </button>
            ) : (
              <div></div>
            )}
            
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center transition-colors duration-200"
              >
                Chương {nextChapter.chapterNumber}
                <ChevronRight size={16} />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 xl:p-8 mb-4 sm:mb-6 lg:mb-8 border border-gray-800">
          {/* Reading Controls */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700">
                         <h3 className="text-sm font-medium text-gray-300 mb-2 sm:mb-3 flex items-center gap-2">
               <Settings size={16} />
               Điều chỉnh đọc
             </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={decreaseFontSize}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  title="Giảm cỡ chữ"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xs sm:text-sm text-gray-300 w-8 sm:w-12 text-center font-medium">{fontSize}px</span>
                <button
                  onClick={increaseFontSize}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  title="Tăng cỡ chữ"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={decreaseLineHeight}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  title="Giảm khoảng cách dòng"
                >
                  <ArrowDown size={16} />
                </button>
                <span className="text-xs sm:text-sm text-gray-300 w-8 sm:w-12 text-center font-medium">{lineHeight.toFixed(1)}</span>
                <button
                  onClick={increaseLineHeight}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  title="Tăng khoảng cách dòng"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Text */}
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-white"
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineHeight,
              textAlign: 'justify'
            }}
          >
            {chapter.content && (
              <div 
                dangerouslySetInnerHTML={{ __html: chapter.content }}
                className="leading-relaxed text-white"
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto transition-colors duration-200"
              >
                <ChevronLeft size={18} />
                Chương trước
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href={`/stories/${storyId}`}
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-gray-600 text-sm sm:text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <List size={18} />
                Danh sách chương
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-gray-600 text-sm sm:text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <BookOpen size={18} />
                Thư Viện
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:px-4 lg:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full sm:w-auto"
              >
                <Home size={18} />
                Trang Chủ
              </Link>
            </div>
            
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto transition-colors duration-200"
              >
                Chương tiếp
                <ChevronRight size={18} />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
