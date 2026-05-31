'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calendar, FileText, CheckCircle } from 'lucide-react';
import { storyService } from '../../../services/storyService';
import { Story, Chapter, Category } from '../../../types/story';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="text-center">
          <div
            className="px-4 py-3 rounded-xl text-xs mb-4"
            style={{ backgroundColor: 'rgba(243,139,168,0.08)', border: '1px solid rgba(243,139,168,0.2)', color: '#f38ba8' }}
          >
            {error || 'Không tìm thấy truyện'}
          </div>
          <button
            onClick={() => router.push('/stories')}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (story.status !== 'public') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="text-center">
          <div
            className="px-4 py-3 rounded-xl text-xs mb-4"
            style={{ backgroundColor: 'rgba(249,226,175,0.08)', border: '1px solid rgba(249,226,175,0.2)', color: '#f9e2af' }}
          >
            Truyện này chưa được xuất bản
          </div>
          <button
            onClick={() => router.push('/stories')}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back link */}
        <div className="mb-5">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs transition-colors duration-200"
            style={{ color: '#6c7086' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại thư viện
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Story Info */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-4 sm:p-5 lg:sticky lg:top-6"
              style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
            >
              {/* Cover Image */}
              <div className="mb-4">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full aspect-[9/16] object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] rounded-xl flex items-center justify-center" style={{ backgroundColor: '#181825' }}>
                    <BookOpen size={40} style={{ color: '#45475a' }} />
                  </div>
                )}
              </div>

              {/* Story Details */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold mb-1" style={{ color: '#cdd6f4' }}>{story.title}</h2>
                  <p className="text-xs leading-relaxed" style={{ color: '#a6adc8' }}>{story.description}</p>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xs font-medium mb-1.5" style={{ color: '#6c7086' }}>Thể loại</h3>
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
                <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid #45475a' }}>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold" style={{ color: '#89b4fa' }}>
                      {chapters.filter(c => c.status === 'public').length}
                    </div>
                    <div className="text-xs flex items-center justify-center gap-1" style={{ color: '#6c7086' }}>
                      <FileText size={12} />
                      Chương
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold" style={{ color: '#a6e3a1' }}>
                      {story.description.split(' ').length}
                    </div>
                    <div className="text-xs flex items-center justify-center gap-1" style={{ color: '#6c7086' }}>
                      <FileText size={12} />
                      Từ
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid #45475a', color: '#6c7086' }}>
                  <Calendar size={12} />
                  Tạo ngày: {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
            >
              <h2 className="text-sm sm:text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#cdd6f4' }}>
                <BookOpen size={18} style={{ color: '#cba6f7' }} />
                Danh sách chương ({chapters.filter(c => c.status === 'public').length})
              </h2>
              
              {chapters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs" style={{ color: '#6c7086' }}>Chưa có chương nào được xuất bản.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters
                    .filter(c => (c.status || 'public') === 'public')
                    .sort((a, b) => a.chapterNumber - b.chapterNumber)
                    .map(chapter => (
                      <Link
                        key={chapter._id}
                        href={`/stories/${storyId}/chapters/${chapter._id}`}
                        className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
                        style={{ backgroundColor: '#181825', border: '1px solid #45475a' }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-medium truncate transition-colors" style={{ color: '#cdd6f4' }}>
                            Chương {chapter.chapterNumber}: {chapter.title}
                          </h3>
                          {chapter.content && (
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#6c7086' }}>
                              {chapter.content.length > 80 ? chapter.content.substring(0, 80) + '…' : chapter.content}
                            </p>
                          )}
                        </div>
                        <span
                          className="ml-3 flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: 'rgba(166,227,161,0.12)', color: '#a6e3a1' }}
                        >
                          <CheckCircle size={10} />
                          Đã xuất bản
                        </span>
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
