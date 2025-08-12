'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Thư Viện Truyện</h1>
            <Link 
              href="/admin" 
              className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Quản Trị
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bộ Lọc</h2>
          
          {/* Search */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên truyện hoặc mô tả..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Categories Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryToggle(category._id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
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
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold">{filteredStories.length}</span> truyện
            {selectedCategories.length > 0 && (
              <span> trong thể loại đã chọn</span>
            )}
          </p>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {stories.length === 0 ? 'Chưa có truyện nào được xuất bản.' : 'Không tìm thấy truyện phù hợp với bộ lọc.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStories.map((story) => (
              <Link
                key={story._id}
                href={`/stories/${story._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Cover Image */}
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">📚</span>
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {story.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.category.slice(0, 3).map((catId) => {
                      const category = categories.find(c => c._id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color 
                          }}
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {story.category.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{story.category.length - 3} thể loại khác
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Đã xuất bản
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
