'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storyService } from '../../../../../services/storyService';
import { Story, Chapter } from '../../../../../types/story';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  const chapterId = params.chapterId as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storyId && chapterId) {
      loadChapterData();
    }
  }, [storyId, chapterId]);

  const loadChapterData = async () => {
    try {
      setIsLoading(true);
      const [storyResponse, chapterResponse, chaptersResponse] = await Promise.all([
        storyService.getStory(storyId),
        storyService.getChapter(chapterId),
        storyService.getChapters(storyId)
      ]);
      
      setStory(storyResponse.story);
      setChapter(chapterResponse.chapter);
      setChapters(chaptersResponse.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
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

  const navigateToChapter = (chapterId: string) => {
    router.push(`/stories/${storyId}/chapters/${chapterId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải chương...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story || !chapter) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || 'Không tìm thấy chương'}
            </div>
            <Link 
              href={`/stories/${storyId}`}
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Quay về truyện
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const previousChapter = getPreviousChapter();
  const nextChapter = getNextChapter();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/stories" className="text-blue-600 hover:text-blue-800">
                  Truyện
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href={`/stories/${storyId}`} className="ml-4 text-blue-600 hover:text-blue-800">
                    {story.title}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">Chương {chapter.chapterNumber}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Chapter Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chương {chapter.chapterNumber}: {chapter.title}
          </h1>
          <p className="text-gray-600">
            {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Chapter Content */}
        <div className="mb-8">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center py-6 border-t border-gray-200">
          <div>
            {previousChapter ? (
              <button
                onClick={() => navigateToChapter(previousChapter._id)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Chương {previousChapter.chapterNumber}: {previousChapter.title}</span>
              </button>
            ) : (
              <span className="text-gray-400">Không có chương trước</span>
            )}
          </div>

          <div>
            {nextChapter ? (
              <button
                onClick={() => navigateToChapter(nextChapter._id)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <span>Chương {nextChapter.chapterNumber}: {nextChapter.title}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="text-gray-400">Không có chương tiếp theo</span>
            )}
          </div>
        </div>

        {/* Back to Story */}
        <div className="text-center">
          <Link 
            href={`/stories/${storyId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Quay về danh sách chương
          </Link>
        </div>
      </div>
    </div>
  );
}
