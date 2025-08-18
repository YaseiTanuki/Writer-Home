'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, Edit3, Trash2, Plus, ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { Category, Story } from '../../../types/story';
import { UpdateCategoryRequest } from '../../../types/story';
import Navigation from '../../../component/Navigation';

export default function AdminCategories() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const [categoriesResponse, storiesResponse] = await Promise.all([
        storyService.getCategories(),
        storyService.getStories()
      ]);
      
      setCategories(categoriesResponse.categories);
      setStories(storiesResponse.stories);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    setDeleteConfirm({ id: categoryId, name: categoryName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(deleteConfirm.id);
      await storyService.deleteCategory(deleteConfirm.id);
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa thể loại thành công!' 
      });
      
      // Reload data after deletion
      await loadData();
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete category:', err);
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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.name.trim()) {
      setNotification({ 
        type: 'error', 
        message: 'Tên thể loại không được để trống!' 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: UpdateCategoryRequest = {
        name: editFormData.name,
        description: editFormData.description || undefined,
        color: editFormData.color
      };
      
      await storyService.updateCategory(editingCategory!._id, updateData);
      
      setNotification({ 
        type: 'success', 
        message: 'Đã cập nhật thể loại thành công!' 
      });
      
      // Reload data after update
      await loadData();
      cancelEdit();
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to update category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      // Auto hide error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStoryCount = (categoryId: string) => {
    return stories.filter(story => story.category.includes(categoryId)).length;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-1.5 sm:p-2 rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm border border-gray-700"
              >
                <ArrowLeft size={16} className="text-gray-300" />
              </Link>
              <div>
                <div className="relative mb-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">
                    <Tag size={20} className="text-pink-300" />
                    <span className="hidden sm:inline">Quản Lý Thể Loại</span>
                    <span className="sm:hidden">Thể Loại</span>
                  </h1>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                    Tổng cộng {categories.length} thể loại
                  </span>
                </div>
              </div>
            </div>
                         <Link
               href="/admin/new-category"
               className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg hover:scale-105"
             >
              <Plus size={16} className="sm:w-[18px]" />
              <span className="hidden sm:inline">Tạo Thể Loại Mới</span>
              <span className="sm:hidden">Tạo Loại</span>
            </Link>
          </div>
        </div>

        {/* Categories List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {categories.map((category) => {
            const storyCount = getStoryCount(category._id);
            
            return (
              <div key={category._id} className="bg-gray-900/50 rounded-md border border-gray-700 p-4 sm:p-6 hover:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:scale-102">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Color Dot */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag size={20} className="text-white sm:w-6" />
                    </div>
                  </div>

                                     {/* Content */}
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between gap-2 sm:gap-4">
                       <div className="flex-1 min-w-0">
                         <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-1 sm:mb-2">
                           {category.name}
                         </h3>
                         
                         {/* Description - Hidden on mobile */}
                         <p className="hidden sm:block text-sm text-gray-300 mb-2">
                           {category.description || 'Không có mô tả'}
                         </p>
                         
                         {/* Date */}
                         <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                           <Calendar size={14} className="sm:w-4" />
                           <span>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</span>
                         </div>
                       </div>

                       {/* Story Count - Always visible on right side */}
                       <div className="flex flex-shrink-0">
                         <div className="flex items-center">
                           <BookOpen size={14} className="text-blue-400 mr-2" />
                           <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
                             {storyCount} truyện
                           </span>
                         </div>
                       </div>
                     </div>

                     {/* Description - Mobile */}
                     <div className="sm:hidden mt-2">
                       <p className="text-xs text-gray-400 truncate">
                         {category.description || 'Không có mô tả'}
                       </p>
                     </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                      {editingCategory?._id === category._id ? (
                        // Edit Form Inline
                        <div className="flex-1 space-y-3">
                          <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-2 py-1.5 text-xs border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="Tên thể loại"
                                required
                              />
                              <input
                                type="color"
                                value={editFormData.color}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, color: e.target.value }))}
                                className="w-full h-8 border border-gray-600 rounded bg-gray-800 cursor-pointer"
                              />
                            </div>
                            <textarea
                              value={editFormData.description}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-2 py-1.5 text-xs border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Mô tả thể loại (tùy chọn)"
                              rows={2}
                            />
                            <div className="flex gap-2">
                                                             <button
                                 type="submit"
                                 disabled={isSubmitting}
                                 className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 disabled:opacity-50"
                               >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200"
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        // Normal Edit Button
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-sm"
                        >
                          <Edit3 size={14} className="sm:w-4" />
                          <span className="hidden sm:inline">Sửa</span>
                          <span className="sm:hidden">Sửa</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(category._id, category.name)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800/50 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 backdrop-blur-sm"
                        disabled={storyCount > 0}
                        title={storyCount > 0 ? 'Không thể xóa thể loại đang được sử dụng' : ''}
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
        {categories.length === 0 && !isLoadingData && (
          <div className="text-center py-12">
            <div className="relative mb-4">
              <Tag size={40} className="mx-auto text-gray-500 mb-2" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-base font-medium text-gray-400 mb-2">Chưa có thể loại nào</h3>
            <p className="text-xs text-gray-500 mb-6">Bắt đầu tạo thể loại đầu tiên của bạn</p>
                         <Link
               href="/admin/new-category"
               className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
             >
              Tạo Thể Loại Mới
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 px-2 sm:px-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-md p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
              </div>
              <div className="ml-2 sm:ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-blue-400">Lưu ý</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-300 space-y-1">
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Thể loại đang được sử dụng bởi truyện sẽ không thể xóa
                  </p>
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Màu sắc của thể loại sẽ được hiển thị trên giao diện người dùng
                  </p>
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Mô tả thể loại giúp người dùng hiểu rõ hơn về nội dung
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-md max-h-full">
            <div className="relative p-4 sm:p-6 text-center">
              <svg className="mx-auto mb-4 text-red-400 w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
              </svg>
              <h3 className="mb-3 sm:mb-5 text-base sm:text-lg font-normal text-white">
                Bạn có chắc chắn muốn xóa thể loại "{deleteConfirm.name}" không?
              </h3>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-300">
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <button
                  onClick={confirmDelete}
                  className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center"
                  disabled={isDeleting === deleteConfirm.id}
                >
                  {isDeleting === deleteConfirm.id ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  onClick={cancelDelete}
                  className="text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center border border-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 z-50 max-w-sm mx-auto sm:mx-0">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 ${
            notification.type === 'success' 
              ? 'bg-green-900/20 border border-green-700 text-green-400' 
              : 'bg-red-900/20 border border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
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
                      ? 'text-green-400 hover:bg-green-900/20' 
                      : 'text-red-400 hover:bg-red-900/20'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-600`}
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
