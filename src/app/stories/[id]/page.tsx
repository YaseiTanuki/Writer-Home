'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { storyService } from '../../../services/storyService';
import { Story, Chapter } from '../../../types/story';

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storyId) {
      loadStoryAndChapters();
    }
  }, [storyId]);

  const loadStoryAndChapters = async () => {
    try {
      setIsLoading(true);
      const [storyResponse, chaptersResponse] = await Promise.all([
        storyService.getStory(storyId),
        storyService.getChapters(storyId)
      ]);
      
      setStory(storyResponse.story);
      setChapters(chaptersResponse.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải truyện...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || 'Không tìm thấy truyện'}
            </div>
            <Link 
              href="/stories"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Quay về danh sách truyện
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/stories"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay về danh sách truyện
          </Link>
        </div>

        {/* Story Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{story.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{story.description}</p>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {story.category.map((cat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              
              {/* Story metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Ngày tạo: {new Date(story.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  story.status === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {story.status === 'public' ? 'Công khai' : 'Bản nháp'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh sách chương</h2>
          
          {chapters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có chương nào được đăng.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <Link 
                    href={`/stories/${storyId}/chapters/${chapter._id}`}
                    className="block hover:text-blue-600"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Chương {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
