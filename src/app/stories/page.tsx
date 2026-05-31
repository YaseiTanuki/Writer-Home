'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Trash2, CheckCircle, Eye, Heart, MessageCircle } from 'lucide-react';
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
      
      const response = await storyService.getStories(searchParams);
      
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: '#a6adc8' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      {/* Hero Section */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 mx-4 sm:mx-6 lg:mx-8 mt-6"
        style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
      >
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ color: '#cba6f7', backgroundColor: 'rgba(203,166,247,0.10)', border: '1px solid rgba(203,166,247,0.25)' }}
          >
            <BookOpen size={12} />
            Thư Viện
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#cdd6f4' }}>Thư Viện Truyện</h1>
          <p className="text-xs sm:text-sm" style={{ color: '#6c7086' }}>Khám phá những câu chuyện thú vị</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-0 sm:py-4">
        {/* Filters */}
        <div
          className="rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6"
          style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
        >
          {/* Main Search Bar - Always Visible */}
          <div className="mb-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6c7086' }} />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên truyện, mô tả, tác giả..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all duration-200"
                  style={{ backgroundColor: '#181825', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }}
                />
              </div>
            </form>
            <p className="text-xs mt-1" style={{ color: '#6c7086' }}>
              Tìm kiếm trong tên truyện, mô tả, tác giả và thể loại
            </p>
          </div>

          {/* View Mode Toggle and Results Summary */}
          <div className="flex items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden p-0.5" style={{ backgroundColor: '#181825' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-200`}
                  style={viewMode === 'grid'
                    ? { backgroundColor: '#cba6f7', color: '#11111b' }
                    : { color: '#6c7086' }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-200`}
                  style={viewMode === 'list'
                    ? { backgroundColor: '#cba6f7', color: '#11111b' }
                    : { color: '#6c7086' }}
                >
                  List
                </button>
              </div>
            </div>

            {/* Results Summary and Clear Filters */}
            {searchTerm.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#cba6f7' }}>
                  {totalStories} truyện
                </span>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium transition-all duration-200 px-1.5 py-0.5 rounded"
                  style={{ color: '#cba6f7', backgroundColor: 'rgba(203,166,247,0.1)' }}
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
           <div className="text-center py-8 px-4">
            <div className="rounded-2xl p-8" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
              <div className="text-xs" style={{ color: '#a6adc8' }}>Đang tải...</div>
            </div>
          </div>
                 ) : filteredStories.length === 0 ? (
           <div className="text-center py-8 px-4">
            <div className="rounded-2xl p-8" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
              <BookOpen size={40} className="mx-auto mb-4" style={{ color: '#cba6f7' }} />
              <div className="text-sm mb-2" style={{ color: '#a6adc8' }}>
                {stories.length === 0 ? 'Chưa có truyện nào được xuất bản.' : 'Không tìm thấy truyện phù hợp.'}
              </div>
              {searchTerm.trim() && (
                <div className="text-xs mb-4" style={{ color: '#6c7086' }}>
                  Hãy thử điều chỉnh từ khóa tìm kiếm.
                </div>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
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
              <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl" style={{ backgroundColor: 'rgba(30,30,46,0.7)' }}>
                <div className="px-5 py-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
                  <p className="text-xs" style={{ color: '#cdd6f4' }}>Đang tìm kiếm...</p>
                </div>
              </div>
            )}
            
                         <div className={`${
               viewMode === 'grid' 
                 ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4' 
                 : 'space-y-3'
             } relative px-4 sm:px-6 lg:px-8`}>
              {filteredStories.map((story, index) => {
                const neonColors = ['#cba6f7', '#89b4fa', '#94e2d5', '#f5c2e7', '#b4befe'];
                const currentNeonColor = neonColors[index % neonColors.length];
                
                return (
                  <Link
                    key={story._id}
                    href={`/stories/${story._id}`}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${
                      viewMode === 'list' ? 'flex items-start gap-0' : 'block'
                    }`}
                    style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
                  >
                       {/* Cover Image */}
                      <div className={`${
                        viewMode === 'list' 
                          ? 'w-20 aspect-[9/16] flex-shrink-0' 
                          : 'w-full aspect-[9/16]'
                      } overflow-hidden`} style={{ backgroundColor: '#181825' }}>
                       {story.coverImage ? (
                         <img
                           src={story.coverImage}
                           alt={story.title}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                           <BookOpen size={28} style={{ color: '#45475a' }} />
                         </div>
                       )}
                     </div>

                      {/* Story Info */}
                      <div className={`${viewMode === 'list' ? 'flex-1 py-3 px-3' : 'p-3'}`}>
                        <h3 className="font-semibold text-xs sm:text-sm mb-1.5 leading-tight group-hover:opacity-80 transition-opacity" style={{ color: '#cba6f7' }}>
                          {story.title}
                        </h3>
                        <p className="text-xs mb-1.5 line-clamp-2" style={{ color: '#6c7086' }}>
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
                           <span className="text-xs text-[#B0BEC5]">
                             +{story.category.length - 2} thể loại khác
                           </span>
                         )}
                       </div>

                        <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: '#a6adc8' }}>
                            {story.likeCount !== undefined && (
                              <span className="flex items-center gap-0.5"><Heart size={10} />{story.likeCount}</span>
                            )}
                            {story.viewCount !== undefined && (
                              <span className="flex items-center gap-0.5"><Eye size={10} />{story.viewCount}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full w-fit" style={{ backgroundColor: 'rgba(166,227,161,0.12)', color: '#a6e3a1' }}>
                              <CheckCircle size={9} />
                              {story.status === 'public' ? 'Đã xuất bản' : 'Bản thảo'}
                            </span>
                            <span className="text-xs" style={{ color: '#45475a' }}>
                              {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                        {/* Read Now Button */}
                        <button
                          className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-90"
                          style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
                        >
                          Đọc ngay
                        </button>
                     </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreStories}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
                >
                  {isLoadingMore ? (
                    <><div className="w-3.5 h-3.5 border-2 border-[#11111b] border-t-transparent rounded-full animate-spin" />Đang tải...</>
                  ) : (
                    <>Tải thêm ({currentPage * ITEMS_PER_PAGE}/{totalStories})</>
                  )}
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-4 text-xs" style={{ color: '#6c7086' }}>
              Trang {currentPage} / {totalPages} · {filteredStories.length} / {totalStories} truyện
            </div>
          </>
        )}
      </div>
    </div>
  );
}