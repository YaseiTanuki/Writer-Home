'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storyService } from '../../../services/storyService';
import { Story, Chapter, Category } from '../../../types/story';
import Navigation from '../../../component/Navigation';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storyId) {
      loadStoryData();
    }
  }, [storyId]);

  const loadStoryData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [storyResponse, chaptersResponse, categoriesResponse] = await Promise.all([
        storyService.getStory(storyId),
        storyService.getChapters(storyId),
        storyService.getCategories()
      ]);
      
      setStory(storyResponse.story);
      setChapters(chaptersResponse.chapters);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      console.error('Failed to load story data:', err);
      setError('Không thể tải thông tin truyện');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds.map(id => {
      const category = categories.find(c => c._id === id);
      return category ? category.name : id;
    }).join(', ');
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.color : '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || 'Không tìm thấy truyện'}
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

  if (story.status !== 'public') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {story.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Khám phá câu chuyện và các chương thú vị
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Story Info - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-24">
              {/* Cover Image */}
              <div className="mb-6">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl sm:text-4xl font-medium">📚</span>
                  </div>
                )}
              </div>

              {/* Story Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{story.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{story.description}</p>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🏷️ Thể loại</h3>
                  <div className="flex flex-wrap gap-2">
                    {story.category.map((catId) => {
                      const category = categories.find(c => c._id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color 
                          }}
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{chapters.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">📖 Chương</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {story.content ? Math.ceil(story.content.length / 1000) : 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">📝 Nghìn từ</div>
                  </div>
                </div>

                {/* Story Content Preview */}
                {story.content && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">📖 Nội dung truyện</h3>
                    <div 
                      className="text-xs sm:text-sm text-gray-600 leading-relaxed max-h-32 overflow-hidden"
                      dangerouslySetInnerHTML={{ 
                        __html: story.content.length > 300 
                          ? story.content.substring(0, 300) + '...' 
                          : story.content 
                      }}
                    />
                  </div>
                )}

                {/* Creation Date */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-500">
                    📅 Ngày tạo: {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  📚 Danh sách chương ({chapters.length})
                </h2>
              </div>

              {chapters.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-gray-500 text-base sm:text-lg mb-4">
                    Chưa có chương nào được xuất bản
                  </div>
                  <p className="text-gray-400 text-sm">
                    Hãy quay lại sau khi tác giả đã đăng chương mới
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {chapters
                    .sort((a, b) => a.chapterNumber - b.chapterNumber)
                    .map((chapter) => (
                    <div key={chapter._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {chapter.chapterNumber}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                <Link 
                                  href={`/stories/${storyId}/chapters/${chapter._id}`}
                                  className="hover:text-blue-600 transition-colors duration-200"
                                >
                                  {chapter.title}
                                </Link>
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs sm:text-sm text-gray-500">
                                <span>📅 {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
                                {chapter.content && (
                                  <span>📝 {Math.ceil(chapter.content.length / 1000)} nghìn từ</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          href={`/stories/${storyId}/chapters/${chapter._id}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full sm:w-auto"
                        >
                          📖 Đọc ngay
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
