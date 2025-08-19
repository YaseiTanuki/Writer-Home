'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, FileText, ChevronLeft, ChevronRight, BookOpen, List, Minus, Plus, ArrowUp, ArrowDown, Settings, Moon, Sun } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  // Update CSS custom property when lineHeight changes
  useEffect(() => {
    document.documentElement.style.setProperty('--custom-line-height', lineHeight.toString());
  }, [lineHeight]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
            <p className="mt-4 text-gray-300 text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story || !chapter) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded text-xs">
              {error || 'Không tìm thấy chương'}
            </div>
            <button 
              onClick={() => router.push(`/stories/${storyId}`)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs"
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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 px-4 py-3 rounded text-xs">
              Truyện này chưa được xuất bản
            </div>
            <button 
              onClick={() => router.push('/stories')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-6"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if ((chapter.status || 'public') !== 'public') {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 px-4 py-3 rounded text-xs">
              Chương này chưa được xuất bản
            </div>
            <button 
              onClick={() => router.push(`/stories/${storyId}`)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs"
            >
              Quay lại truyện
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
      <div className="pt-16 md:pt-24 w-full px-0 sm:px-4 lg:px-8 py-0 sm:py-4">
        {/* Chapter Header */}
        <div className="bg-gray-900/50 rounded-md shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-700 backdrop-blur-sm mx-4 sm:mx-0">
          <div className="text-center mb-3 sm:mb-4 lg:mb-6">
            <div className="relative mb-3">
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Chương {chapter.chapterNumber}: {chapter.title}
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-gray-300 text-xs">
              <span className="inline-flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <Calendar size={14} />
                {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
              </span>
              {chapter.content && (
                <>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
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
                className="inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-2 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center transition-colors duration-200"
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
                className="inline-flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-2 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center transition-colors duration-200"
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
        <div className={`rounded-md shadow-lg p-3 sm:p-4 lg:p-6 xl:p-8 mb-4 sm:mb-6 lg:mb-8 border backdrop-blur-sm transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-gray-900/50 border-gray-700' 
            : 'bg-white/90 border-gray-300'
        }`}>
                     {/* Reading Controls */}
           <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-md border backdrop-blur-sm transition-colors duration-200 ${
             isDarkMode 
               ? 'bg-gray-800/50 border-gray-700' 
               : 'bg-gray-200/80 border-gray-400'
           }`}>
                         <h3 className={`text-xs font-medium mb-2 sm:mb-3 flex items-center gap-2 transition-colors duration-200 ${
               isDarkMode ? 'text-gray-300' : 'text-gray-700'
             }`}>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <Settings size={16} />
              Điều chỉnh đọc
            </h3>
            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4">
                             <div className="flex items-center space-x-1 sm:space-x-2">
                 <button
                   onClick={decreaseFontSize}
                   className={`p-1.5 sm:p-2 rounded transition-colors duration-200 ${
                     isDarkMode 
                       ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                       : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                   }`}
                   title="Giảm cỡ chữ"
                 >
                   <Minus size={16} />
                 </button>
                 <span className={`text-xs w-8 sm:w-12 text-center font-medium transition-colors duration-200 ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>{fontSize}px</span>
                 <button
                   onClick={increaseFontSize}
                   className={`p-1.5 sm:p-2 rounded transition-colors duration-200 ${
                     isDarkMode 
                       ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                       : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                   }`}
                   title="Tăng cỡ chữ"
                 >
                   <Plus size={16} />
                 </button>
               </div>
               
               <div className="flex items-center space-x-1 sm:space-x-2">
                 <button
                   onClick={decreaseLineHeight}
                   className={`p-1.5 sm:p-2 rounded transition-colors duration-200 ${
                     isDarkMode 
                       ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                       : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                   }`}
                   title="Giảm khoảng cách dòng"
                 >
                   <ArrowDown size={16} />
                 </button>
                 <span className={`text-xs w-8 sm:w-12 text-center font-medium transition-colors duration-200 ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>{lineHeight.toFixed(1)}</span>
                 <button
                   onClick={increaseLineHeight}
                   className={`p-1.5 sm:p-2 rounded transition-colors duration-200 ${
                     isDarkMode 
                       ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                       : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                   }`}
                   title="Tăng khoảng cách dòng"
                 >
                   <ArrowUp size={16} />
                 </button>
               </div>

                             {/* Theme Toggle Switch */}
               <div className="flex items-center space-x-2">
                 <Sun 
                   size={16} 
                   className={`transition-colors duration-200 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-700'
                   }`} 
                 />
                 <button
                   onClick={() => setIsDarkMode(!isDarkMode)}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                     isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
                   }`}
                   title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                 >
                   <span
                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                       isDarkMode ? 'translate-x-6' : 'translate-x-1'
                     }`}
                   />
                 </button>
                 <Moon 
                   size={16} 
                   className={`transition-colors duration-200 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-700'
                   }`} 
                 />
               </div>
            </div>
          </div>

          {/* Chapter Text */}
          <div 
            className={`max-w-none chapter-content transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineHeight,
              textAlign: 'justify',
              '--custom-line-height': lineHeight,
            } as React.CSSProperties}
          >
            {chapter.content && (
              <div 
                dangerouslySetInnerHTML={{ __html: chapter.content }}
                className={`chapter-content transition-colors duration-200 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}
                style={{ 
                  lineHeight: lineHeight,
                  '--custom-line-height': lineHeight,
                } as React.CSSProperties}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-gray-900/50 rounded-md shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm w-full sm:w-auto backdrop-blur-sm"
              >
                <List size={18} />
                Danh sách chương
              </Link>
            </div>
            
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
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
