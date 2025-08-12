'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../component/Navigation';
import { storyService } from '../../services/storyService';
import { Story, Category } from '../../types/story';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, selectedCategories, searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storiesResponse, categoriesResponse] = await Promise.all([
        storyService.getStories({ status: 'public' }),
        storyService.getCategories()
      ]);
      
      setStories(storiesResponse.stories);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories.filter(story => story.status === 'public');

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(story => 
        story.category.some(catId => selectedCategories.includes(catId))
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(term) ||
        story.description.toLowerCase().includes(term)
      );
    }

    setFilteredStories(filtered);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds.map(id => {
      const category = categories.find(c => c._id === id);
      return category ? category.name : id;
    }).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                📚 Thư Viện Truyện
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Khám phá những câu chuyện thú vị từ các tác giả tài năng
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
            >
              🏠 Trang Chủ
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">🔍 Bộ Lọc</h2>
          
          {/* Search */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên truyện hoặc mô tả..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Categories Filter */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryToggle(category._id)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    selectedCategories.includes(category._id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{
                    border: selectedCategories.includes(category._id) ? 'none' : `2px solid ${category.color}`
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCategories.length > 0 || searchTerm.trim()) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              🗑️ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 text-center sm:text-left">
            Tìm thấy <span className="font-semibold text-blue-600">{filteredStories.length}</span> truyện
            {selectedCategories.length > 0 && (
              <span> trong thể loại đã chọn</span>
            )}
          </p>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-base sm:text-lg">
              {stories.length === 0 ? 'Chưa có truyện nào được xuất bản.' : 'Không tìm thấy truyện phù hợp với bộ lọc.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredStories.map((story) => (
              <Link
                key={story._id}
                href={`/stories/${story._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
              >
                {/* Cover Image */}
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-32 sm:h-40 lg:h-48 xl:h-56 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-32 sm:h-40 lg:h-48 xl:h-56 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xl sm:text-2xl lg:text-3xl font-medium">📚</span>
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {story.title}
                  </h3>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-3 leading-relaxed">
                    {story.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                    {story.category.slice(0, 2).map((catId) => {
                      const category = categories.find(c => c._id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full"
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color 
                          }}
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {story.category.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{story.category.length - 2} thể loại khác
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 w-fit">
                      ✅ Đã xuất bản
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
