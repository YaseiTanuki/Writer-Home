'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Home, Calendar, FileText, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
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
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                {story.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Khám phá câu chuyện và các chương thú vị
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <BookOpen size={18} />
                Thư Viện
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <Home size={18} />
                Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Story Info - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 sticky top-24 border border-gray-800">
              {/* Cover Image */}
              <div className="mb-4 sm:mb-6">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-40 sm:h-48 lg:h-64 object-cover rounded-lg"
                  />
                ) : (
                                     <div className="w-full h-40 sm:h-48 lg:h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                     <BookOpen size={48} className="text-white" />
                   </div>
                )}
              </div>

              {/* Story Details */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 leading-tight">{story.title}</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{story.description}</p>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Thể loại</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {story.category.map((catId) => {
                      const category = categories.find(c => c._id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full"
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
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-800">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">{chapters.length}</div>
                    <div className="text-xs sm:text-sm text-gray-300 flex items-center justify-center gap-1">
                      <FileText size={14} />
                      Chương
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
                      {story.description.split(' ').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300 flex items-center justify-center gap-1">
                      <FileText size={14} />
                      Từ
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="pt-3 sm:pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Nội dung
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                    {story.description}
                  </p>
                </div>

                {/* Creation Date */}
                <div className="pt-3 sm:pt-4 border-t border-gray-800">
                  <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <Calendar size={14} />
                    Tạo ngày: {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <BookOpen size={20} />
                Danh sách chương ({chapters.length})
              </h2>
              
              {chapters.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-400 text-base sm:text-lg">
                    Chưa có chương nào được xuất bản.
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {chapters
                    .sort((a, b) => a.chapterNumber - b.chapterNumber)
                    .map((chapter) => (
                      <Link
                        key={chapter._id}
                        href={`/stories/${storyId}/chapters/${chapter._id}`}
                        className="block p-3 sm:p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium text-white group-hover:text-blue-400 transition-colors duration-200 truncate">
                              Chương {chapter.chapterNumber}: {chapter.title}
                            </h3>
                            {chapter.content && (
                              <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">
                                {chapter.content.length > 100 ? chapter.content.substring(0, 100) + '...' : chapter.content}
                              </p>
                            )}
                          </div>
                          <div className="ml-3 sm:ml-4 flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-green-900/20 text-green-400 border border-green-700">
                              <CheckCircle size={14} />
                              Đã xuất bản
                            </span>
                          </div>
                        </div>
                      </Link>
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
