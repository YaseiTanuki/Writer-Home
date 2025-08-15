'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Home, Search, Trash2, CheckCircle, Filter, SortAsc, SortDesc, Calendar, User, Eye, Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navigation from '../../component/Navigation';
import { storyService } from '../../services/storyService';
import { Story, Category } from '../../types/story';

type SortOption = 'newest' | 'oldest' | 'title' | 'popular' | 'recentlyUpdated';
type StatusFilter = 'all' | 'public' | 'draft';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('public');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortStories();
  }, [stories, selectedCategories, searchTerm, sortBy, statusFilter, authorFilter, dateRange]);

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

  const filterAndSortStories = () => {
    let filtered = [...stories];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter);
    }

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
        story.description.toLowerCase().includes(term) ||
        (story.author && story.author.toLowerCase().includes(term))
      );
    }

    // Filter by author
    if (authorFilter.trim()) {
      const author = authorFilter.toLowerCase();
      filtered = filtered.filter(story => 
        story.author && story.author.toLowerCase().includes(author)
      );
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && endDate) {
          return storyDate >= startDate && storyDate <= endDate;
        } else if (startDate) {
          return storyDate >= startDate;
        } else if (endDate) {
          return storyDate <= endDate;
        }
        return true;
      });
    }

    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'vi');
        case 'popular':
          return (b.likeCount || 0) - (a.likeCount || 0);
        case 'recentlyUpdated':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        default:
          return 0;
      }
    });

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
    setSortBy('newest');
    setStatusFilter('public');
    setAuthorFilter('');
    setDateRange({ start: '', end: '' });
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds.map(id => {
      const category = categories.find(c => c._id === id);
      return category ? category.name : id;
    }).join(', ');
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'Mới nhất';
      case 'oldest': return 'Cũ nhất';
      case 'title': return 'Tên truyện';
      case 'popular': return 'Phổ biến';
      case 'recentlyUpdated': return 'Cập nhật gần đây';
      default: return 'Mới nhất';
    }
  };

  const getStatusLabel = (status: StatusFilter) => {
    switch (status) {
      case 'all': return 'Tất cả';
      case 'public': return 'Đã xuất bản';
      case 'draft': return 'Bản thảo';
      default: return 'Đã xuất bản';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-16 md:pt-24">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-24">
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen size={32} />
              Thư Viện Truyện
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Khám phá những câu chuyện thú vị từ các tác giả tài năng
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
            >
              <Home size={18} />
              Trang Chủ
            </Link>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800 mx-4 sm:mx-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-medium text-white flex items-center gap-2">
              <Filter size={24} />
              Bộ Lọc Nâng Cao
            </h2>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvancedFilters ? 'Thu gọn' : 'Mở rộng'}
            </button>
          </div>
          
          {/* Basic Filters - Always Visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-gray-300 mb-1">
                <Search size={14} className="inline mr-1" />
                Tìm kiếm
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên truyện, mô tả..."
                className="w-full px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
              />
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-xs font-medium text-gray-300 mb-1">
                <SortAsc size={14} className="inline mr-1" />
                Sắp xếp
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Tên truyện</option>
                <option value="popular">Phổ biến</option>
                <option value="recentlyUpdated">Cập nhật gần đây</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-300 mb-1">
                <CheckCircle size={14} className="inline mr-1" />
                Trạng thái
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white"
              >
                <option value="public">Đã xuất bản</option>
                <option value="draft">Bản thảo</option>
                <option value="all">Tất cả</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Chế độ xem
              </label>
              <div className="flex bg-gray-800 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-700 pt-4 space-y-4">
              {/* Categories Filter - Compact */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Thể loại (chọn tối đa 5)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {categories.slice(0, 10).map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryToggle(category._id)}
                      disabled={selectedCategories.length >= 5 && !selectedCategories.includes(category._id)}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        selectedCategories.includes(category._id)
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : selectedCategories.length >= 5 && !selectedCategories.includes(category._id)
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                      }`}
                      style={{
                        border: selectedCategories.includes(category._id) ? 'none' : `1px solid ${category.color}`
                      }}
                      title={category.name}
                    >
                      <span className="truncate block">{category.name}</span>
                    </button>
                  ))}
                  {categories.length > 10 && (
                    <div className="text-xs text-gray-500 flex items-center justify-center px-2 py-1.5">
                      +{categories.length - 10} thể loại khác
                    </div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Đã chọn: {selectedCategories.length}/5 thể loại
                  </div>
                )}
              </div>

              {/* Author and Date Filters - Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="author" className="block text-xs font-medium text-gray-300 mb-1">
                    <User size={14} className="inline mr-1" />
                    Tác giả
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    placeholder="Tìm theo tác giả..."
                    className="w-full px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    <Calendar size={14} className="inline mr-1" />
                    Khoảng thời gian
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Summary and Actions - Compact */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-3">
              {/* Active Filters Count */}
              {(selectedCategories.length > 0 || searchTerm.trim() || authorFilter.trim() || dateRange.start || dateRange.end) && (
                <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full">
                  {[
                    selectedCategories.length > 0 && `${selectedCategories.length} thể loại`,
                    searchTerm.trim() && 'tìm kiếm',
                    authorFilter.trim() && 'tác giả',
                    (dateRange.start || dateRange.end) && 'thời gian'
                  ].filter(Boolean).length} bộ lọc đang hoạt động
                </span>
              )}
            </div>

            {/* Clear Filters */}
            {(selectedCategories.length > 0 || searchTerm.trim() || authorFilter.trim() || dateRange.start || dateRange.end) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium transition-colors bg-red-900/20 hover:bg-red-900/30 px-2 py-1 rounded-md"
              >
                <Trash2 size={14} />
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 px-4 sm:px-0">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-lg text-white">
                  Tìm thấy <span className="font-bold text-blue-400">{filteredStories.length}</span> truyện
                </p>
                <p className="text-sm text-gray-400">
                  {sortBy !== 'newest' && `Sắp xếp theo: ${getSortLabel(sortBy)}`}
                  {statusFilter !== 'public' && ` • Trạng thái: ${getStatusLabel(statusFilter)}`}
                  {selectedCategories.length > 0 && ` • Thể loại: ${selectedCategories.length} đã chọn`}
                </p>
              </div>
              
              {filteredStories.length > 0 && (
                <div className="text-center sm:text-right">
                  <p className="text-sm text-gray-400">
                    Tổng cộng: <span className="text-white font-medium">{stories.length}</span> truyện
                  </p>
                  <p className="text-xs text-gray-500">
                    Hiển thị {filteredStories.length} kết quả
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stories Display */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 px-4 sm:px-0">
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <BookOpen size={48} className="text-gray-500 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">
                {stories.length === 0 ? 'Chưa có truyện nào được xuất bản.' : 'Không tìm thấy truyện phù hợp với bộ lọc.'}
              </div>
              {(searchTerm.trim() || selectedCategories.length > 0 || authorFilter.trim() || dateRange.start || dateRange.end) && (
                <div className="text-gray-500 text-sm mb-4">
                  Hãy thử điều chỉnh bộ lọc hoặc xóa một số điều kiện tìm kiếm.
                </div>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={16} />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6' 
              : 'space-y-4'
          }`}>
            {filteredStories.map((story) => (
              <Link
                key={story._id}
                href={`/stories/${story._id}`}
                className={`bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-800 hover:border-blue-500/50 ${
                  viewMode === 'list' ? 'flex' : 'block'
                }`}
              >
                {/* Cover Image */}
                <div className={`${
                  viewMode === 'list' 
                    ? 'w-24 h-32 flex-shrink-0' 
                    : 'w-full h-40 lg:h-48 xl:h-56'
                } bg-gray-200`}>
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300`}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center`}>
                      <BookOpen size={viewMode === 'list' ? 32 : 48} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className={`p-3 lg:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className={`font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200 leading-tight ${
                    viewMode === 'list' ? 'text-base' : 'text-sm lg:text-lg'
                  }`}>
                    {story.title}
                  </h3>
                  
                  <p className={`text-gray-300 mb-3 line-clamp-3 leading-relaxed ${
                    viewMode === 'list' ? 'text-sm' : 'text-xs lg:text-sm'
                  }`}>
                    {story.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.category.slice(0, viewMode === 'list' ? 3 : 2).map((catId) => {
                      const category = categories.find(c => c._id === catId);
                      return category ? (
                        <span
                          key={catId}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            viewMode === 'list' ? 'px-2 py-1' : 'px-1.5 py-0.5'
                          }`}
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color 
                          }}
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                    {story.category.length > (viewMode === 'list' ? 3 : 2) && (
                      <span className="text-xs text-gray-400">
                        +{story.category.length - (viewMode === 'list' ? 3 : 2)} thể loại khác
                      </span>
                    )}
                  </div>

                  {/* Stats and Status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {story.likeCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {story.likeCount}
                        </span>
                      )}
                      {story.commentCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {story.commentCount}
                        </span>
                      )}
                      {story.viewCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {story.viewCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-900/20 text-green-400 border border-green-700">
                        <CheckCircle size={12} />
                        {story.status === 'public' ? 'Đã xuất bản' : 'Bản thảo'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
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
