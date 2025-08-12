'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storyService } from '../../services/storyService';
import { Story } from '../../types/story';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: 'public', category: '' });

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const params: any = { status: filter.status };
      if (filter.category) params.category = filter.category;
      
      const response = await storyService.getStories(params);
      setStories(response.stories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(prev => ({ ...prev, category: e.target.value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải truyện...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button 
              onClick={loadStories}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Truyện</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Thể loại
              </label>
              <select
                id="category"
                value={filter.category}
                onChange={handleCategoryChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả thể loại</option>
                <option value="Huyền huyễn">Huyền huyễn</option>
                <option value="Tiên hiệp">Tiên hiệp</option>
                <option value="Tình cảm">Tình cảm</option>
                <option value="Phiêu lưu">Phiêu lưu</option>
                <option value="Kinh dị">Kinh dị</option>
                <option value="Hài hước">Hài hước</option>
              </select>
            </div>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có truyện nào được đăng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/stories/${story._id}`} className="hover:text-blue-600">
                      {story.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {story.description}
                  </p>
                  
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {story.category.map((cat, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(story.createdAt).toLocaleDateString('vi-VN')}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
