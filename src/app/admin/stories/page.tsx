'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Edit3, Trash2, Plus, ArrowLeft, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { Story, Category } from '../../../types/story';
import Navigation from '../../../component/Navigation';

export default function AdminStories() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [storiesResponse, categoriesResponse] = await Promise.all([
        storyService.getStories(),
        storyService.getCategories()
      ]);
      
      setStories(storiesResponse.stories);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteStory = async (storyId: string, storyTitle: string) => {
    setDeleteConfirm({ id: storyId, title: storyTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(deleteConfirm.id);
      await storyService.deleteStory(deleteConfirm.id);
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa truyện và tất cả chương liên quan thành công!' 
      });
      
      // Reload data after deletion
      await loadData();
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      // Auto hide error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds.map(id => {
      const category = categories.find(c => c._id === id);
      return category ? category.name : id;
    }).join(', ');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
            <p className="mt-4 text-[#B0BEC5] text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-1.5 sm:p-2 rounded-md bg-[#1E1E1E] hover:bg-[#2A2A2A] transition-all duration-200 backdrop-blur-sm border-2 border-[#D2691E]/30 hover:border-[#D2691E]/50"
              >
                <ArrowLeft size={16} className="text-[#00E5FF]" />
              </Link>
              <div>
                <div className="relative mb-2">
                  <h1 className="text-lg sm:text-xl font-bold text-[#FFFFFF] flex items-center gap-2 sm:gap-3">
                    <BookOpen size={20} className="text-[#00E5FF]" />
                    <span className="hidden sm:inline">Quản Lý Truyện</span>
                    <span className="sm:hidden">Truyện</span>
                  </h1>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#D2691E] rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs sm:text-sm text-[#B0BEC5] mt-1">
                                      <span className="inline-flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                      Tổng cộng {stories.length} truyện
                    </span>
                </div>
              </div>
            </div>
            <Link
              href="/admin/new-story"
              className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg hover:scale-105"
            >
              <Plus size={16} className="sm:w-[18px]" />
              <span className="hidden sm:inline">Tạo Truyện Mới</span>
              <span className="sm:hidden">Tạo Truyện</span>
            </Link>
          </div>
        </div>

        {/* Stories List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {stories.map((story, index) => {
            const neonColors = ['#D2691E', '#D2691E', '#D2691E', '#D2691E', '#D2691E'];
            const currentNeonColor = neonColors[index % neonColors.length];
            
            return (
              <div key={story._id} className="bg-[#1E1E1E] rounded-2xl border-2 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:scale-102" style={{ borderColor: currentNeonColor, boxShadow: `0 0 8px ${currentNeonColor}` }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Cover Image */}
                  <div className="flex-shrink-0">
                    {story.coverImage ? (
                      <img 
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover" 
                        src={story.coverImage} 
                        alt={story.title} 
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentNeonColor }}>
                        <BookOpen size={20} className="text-white sm:w-6" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold text-[#FFFFFF] truncate mb-1 sm:mb-2">
                          {story.title}
                        </h3>
                        
                        {/* Description - Hidden on mobile */}
                        <p className="hidden sm:block text-sm text-[#B0BEC5] mb-2 line-clamp-2">
                          {story.description}
                        </p>
                        
                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#B0BEC5]">
                          <Calendar size={14} className="sm:w-4" />
                          <span>{new Date(story.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {story.status === 'public' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#F4A460]/20 text-[#F4A460] border-2 border-[#F4A460]/50 whitespace-nowrap">
                            <CheckCircle size={12} className="sm:w-3" />
                            <span className="hidden sm:inline">Đã xuất bản</span>
                            <span className="sm:hidden">XB</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#F4A460]/20 text-[#F4A460] border-2 border-[#F4A460]/50 whitespace-nowrap">
                            <AlertTriangle size={12} className="sm:w-3" />
                            <span className="hidden sm:inline">Bản thảo</span>
                            <span className="sm:hidden">BT</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Categories - Hidden on mobile */}
                    <div className="hidden sm:flex flex-wrap gap-1 mt-2">
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
                        <span className="text-xs text-[#B0BEC5]">
                          +{story.category.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <Link
                        href={`/admin/stories/${story._id}/edit`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 border-2 border-[#00E5FF] text-xs sm:text-sm font-medium rounded-lg text-[#00E5FF] bg-[#1E1E1E] hover:bg-[#00E5FF]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E5FF] transition-colors duration-200"
                      >
                        <Edit3 size={14} className="sm:w-4" />
                        <span className="hidden sm:inline">Sửa</span>
                        <span className="sm:hidden">Sửa</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteStory(story._id, story.title)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 border-2 border-[#00E5FF] text-xs sm:text-sm font-medium rounded-lg text-[#00E5FF] bg-[#1E1E1E] hover:bg-[#00E5FF]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E5FF] transition-colors duration-200"
                      >
                        <Trash2 size={14} className="sm:w-4" />
                        <span className="hidden sm:inline">Xóa</span>
                        <span className="sm:hidden">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {stories.length === 0 && !isLoadingData && (
          <div className="text-center py-12">
            <div className="bg-[#1E1E1E] rounded-2xl border-2 border-[#D2691E] p-8 max-w-md mx-auto shadow-[0_0_8px_#D2691E]">
              <BookOpen size={48} className="mx-auto text-[#00E5FF] mb-4" />
              <h3 className="text-lg font-medium text-[#FFFFFF] mb-2">Chưa có truyện nào</h3>
              <p className="text-sm text-[#B0BEC5] mb-6">Bắt đầu tạo truyện đầu tiên của bạn</p>
              <Link
                href="/admin/new-story"
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Tạo Truyện Mới
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-md max-h-full">
            <div className="relative bg-[#1E1E1E] rounded-2xl shadow-lg border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
              <div className="p-4 sm:p-6 text-center">
                                  <svg className="mx-auto mb-4 text-[#00E5FF] w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-3 sm:mb-5 text-base sm:text-lg font-normal text-[#FFFFFF]">
                  Bạn có chắc chắn muốn xóa "{deleteConfirm.title}" không?
                </h3>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#00E5FF] bg-[#00E5FF]/10 p-2 sm:p-3 rounded-lg border-2 border-[#00E5FF]/30">
                  <AlertTriangle size={14} className="inline mr-1 sm:mr-2" />
                  <strong>Lưu ý:</strong> Khi xóa truyện này, tất cả các chương liên quan cũng sẽ bị xóa vĩnh viễn!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <button
                    onClick={confirmDelete}
                    className="text-[#1E1E1E] bg-[#00E5FF] hover:bg-[#00E5FF]/90 focus:ring-4 focus:outline-none focus:ring-[#00E5FF]/50 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center shadow-md hover:shadow-lg"
                    disabled={isDeleting === deleteConfirm.id}
                  >
                    {isDeleting === deleteConfirm.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="text-[#B0BEC5] bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:ring-4 focus:outline-none focus:ring-[#00E5FF]/50 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center border-2 border-[#00E5FF]/50 hover:border-[#00E5FF] transition-all duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 z-50 max-w-sm mx-auto sm:mx-0">
          <div className={`rounded-2xl shadow-lg p-3 sm:p-4 border-2 ${
            notification.type === 'success' 
              ? 'bg-[#F4A460]/10 border-[#F4A460] text-[#F4A460]' 
              : 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle size={18} className="text-[#F4A460] sm:w-5" />
                ) : (
                  <AlertTriangle size={18} className="text-[#00E5FF] sm:w-5" />
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <p className="text-xs sm:text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1 sm:p-1.5 ${
                    notification.type === 'success' 
                                        ? 'text-[#F4A460] hover:bg-[#F4A460]/10' 
                  : 'text-[#00E5FF] hover:bg-[#00E5FF]/10'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#00E5FF] transition-all duration-200`}
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
