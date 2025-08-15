'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Search, Trash2, CheckCircle, Eye, Heart, MessageCircle } from 'lucide-react';
import Navigation from '../../component/Navigation';
import { storyService } from '../../services/storyService';
import { Story, Category } from '../../types/story';

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Thêm state cho search loading

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, append = false) => {
    try {
      if (page === 1 && !append) {
        // Chỉ set loading cho lần đầu load, không phải search
        if (stories.length === 0) {
          setIsLoading(true);
        } else {
          setIsSearching(true); // Sử dụng search loading thay vì page loading
        }
      } else {
        setIsLoadingMore(true);
      }

      // Load categories if not loaded yet
      if (categories.length === 0) {
        const categoriesResponse = await storyService.getCategories();
        setCategories(categoriesResponse.categories);
      }

      const searchParams = { 
        status: 'public',
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm.trim() || undefined
      };
      
      console.log('API call params:', searchParams);
      
      const response = await storyService.getStories(searchParams);
      
      console.log('API response:', response);
      
      if (append) {
        // Append new stories to existing ones
        setStories(prev => [...prev, ...response.stories]);
      } else {
        // Replace stories for new search or first page
        setStories(response.stories);
      }
      
      setTotalStories(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / ITEMS_PER_PAGE));
      setHasMore(page < Math.ceil((response.count || 0) / ITEMS_PER_PAGE));
      
      // Set filtered stories (same as stories for pagination)
      setFilteredStories(response.stories);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsSearching(false);
    }
  };

  const loadMoreStories = async () => {
    if (isLoadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadData(nextPage, true);
  };

  const handleSearch = async () => {
    console.log('Searching for:', searchTerm);
    setCurrentPage(1);
    await loadData(1, false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadData(1, false);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categories.find(cat => cat._id === id)?.name)
      .filter(Boolean)
      .join(', ');
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
            <p className="mt-4 text-gray-300 text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-24">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 rounded-lg shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 mx-4 sm:mx-0">
        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-white mb-3">
            Thư Viện Truyện
          </h1>
          <p className="text-xs text-gray-300">
            Khám phá những câu chuyện thú vị từ các tác giả tài năng
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-8">
        {/* Enhanced Filters - Simplified Layout */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-800 mx-4 sm:mx-0">
          {/* Main Search Bar - Always Visible */}
          <div className="mb-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên truyện, mô tả, tác giả, thể loại..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                />
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-1">
              Tìm kiếm trong tên truyện, mô tả, tác giả và thể loại
            </p>
          </div>

          {/* View Mode Toggle and Results Summary */}
          <div className="flex items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-700 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Results Summary and Clear Filters */}
            {searchTerm.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400">
                  {totalStories} truyện
                </span>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium transition-colors bg-red-900/20 hover:bg-red-900/30 px-1.5 py-0.5 rounded"
                >
                  <Trash2 size={12} />
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stories Display */}
        {isLoading ? (
          <div className="text-center py-12 px-4 sm:px-0">
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <div className="text-gray-400 text-sm mb-2">Đang tải...</div>
            </div>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12 px-4 sm:px-0">
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <BookOpen size={48} className="text-gray-500 mx-auto mb-4" />
              <div className="text-gray-400 text-sm mb-2">
                {stories.length === 0 ? 'Chưa có truyện nào được xuất bản.' : 'Không tìm thấy truyện phù hợp với bộ lọc.'}
              </div>
              {searchTerm.trim() && (
                <div className="text-gray-500 text-xs mb-4">
                  Hãy thử điều chỉnh bộ lọc hoặc xóa một số điều kiện tìm kiếm.
                </div>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-xs"
              >
                <Trash2 size={16} />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search Loading Overlay */}
            {isSearching && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <Image
                      src="/reading.gif"
                      alt="Loading..."
                      width={48}
                      height={48}
                      className="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-xs">Đang tìm kiếm...</p>
                </div>
              </div>
            )}
            
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6' 
                : 'space-y-4'
            } relative`}>
              {filteredStories.map((story) => (
                <Link
                  key={story._id}
                  href={`/stories/${story._id}`}
                  className={`bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-800 hover:border-blue-500/50 ${
                    viewMode === 'list' ? 'flex items-start gap-4' : 'block'
                  }`}
                >
                  {/* Cover Image */}
                  <div className={`${
                    viewMode === 'list' 
                      ? 'w-20 h-28 flex-shrink-0 rounded-l-lg' 
                      : 'w-full h-40 lg:h-48 xl:h-56'
                  } bg-gray-200`}>
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'rounded-l-lg' : ''
                        }`}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${
                        viewMode === 'list' ? 'rounded-l-lg' : ''
                      }`}>
                        <BookOpen size={viewMode === 'list' ? 24 : 48} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Story Info */}
                  <div className={`${viewMode === 'list' ? 'flex-1 py-3 pr-3' : 'p-3 lg:p-4'}`}>
                    <h3 className={`font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200 leading-tight ${
                      viewMode === 'list' ? 'text-xs' : 'text-xs lg:text-sm'
                    }`}>
                      {story.title}
                    </h3>
                    
                    <p className={`text-gray-300 mb-2 line-clamp-2 leading-relaxed ${
                      viewMode === 'list' ? 'text-xs' : 'text-xs lg:text-sm'
                    }`}>
                      {story.description}
                    </p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {story.category.slice(0, 2).map((catId) => {
                        const category = categories.find(c => c._id === catId);
                        return category ? (
                          <span
                            key={catId}
                            className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full`}
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
                        <span className="text-xs text-gray-400">
                          +{story.category.length - 2} thể loại khác
                        </span>
                      )}
                    </div>

                    {/* Stats and Status */}
                    <div className={`flex items-center justify-between gap-2 ${
                      viewMode === 'list' ? 'text-xs' : 'text-xs'
                    }`}>
                      <div className="flex items-center gap-2 text-gray-400">
                        {story.likeCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Heart size={10} />
                            {story.likeCount}
                          </span>
                        )}
                        {story.commentCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageCircle size={10} />
                            {story.commentCount}
                          </span>
                        )}
                        {story.viewCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {story.viewCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-green-900/20 text-green-400 border border-green-700">
                          <CheckCircle size={10} />
                          {story.status === 'public' ? 'Đã xuất bản' : 'Bản thảo'}
                        </span>
                        <span className="text-gray-400">
                          {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreStories}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors text-xs"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      Tải thêm truyện ({currentPage * ITEMS_PER_PAGE}/{totalStories})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-4 text-xs text-gray-400">
              Trang {currentPage} / {totalPages} • Hiển thị {filteredStories.length} / {totalStories} truyện
            </div>
          </>
        )}
      </div>
    </div>
  );
}