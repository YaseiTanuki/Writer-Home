'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story || !chapter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapter Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Chương {chapter.chapterNumber}: {chapter.title}
            </h1>
            <div className="text-gray-600 text-sm sm:text-base">
              <span>📅 {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
              {chapter.content && (
                <>
                  <span className="mx-2">•</span>
                  <span>📝 {Math.ceil(chapter.content.length / 1000)} nghìn từ</span>
                </>
              )}
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 gap-3">
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
              >
                ← Chương {previousChapter.chapterNumber}: {previousChapter.title}
              </button>
            ) : (
              <div></div>
            )}
            
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
              >
                Chương {nextChapter.chapterNumber}: {nextChapter.title} →
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 mb-6 sm:mb-8">
          {/* Reading Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">🎛️ Điều chỉnh đọc</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={decreaseFontSize}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
                  title="Giảm cỡ chữ"
                >
                  A-
                </button>
                <span className="text-sm text-gray-600 w-12 text-center font-medium">{fontSize}px</span>
                <button
                  onClick={increaseFontSize}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
                  title="Tăng cỡ chữ"
                >
                  A+
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={decreaseLineHeight}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
                  title="Giảm khoảng cách dòng"
                >
                  ↓
                </button>
                <span className="text-sm text-gray-600 w-12 text-center font-medium">{lineHeight.toFixed(1)}</span>
                <button
                  onClick={increaseLineHeight}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
                  title="Tăng khoảng cách dòng"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>

          {chapter.content ? (
            <div 
              className="prose prose-sm sm:prose-lg max-w-none"
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight
              }}
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Chương này chưa có nội dung
              </div>
            </div>
          )}
        </div>

        {/* Chapter Navigation Bottom */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                ← Chương trước
              </button>
            ) : (
              <div></div>
            )}
            
            <Link
              href={`/stories/${storyId}`}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              📚 Danh sách chương
            </Link>
            
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                Chương tiếp →
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
