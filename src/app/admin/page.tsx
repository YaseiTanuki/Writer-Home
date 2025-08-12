'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { storyService } from '../../services/storyService';
import { Story, Chapter, Category } from '../../types/story';
import Navigation from '../../component/Navigation';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'story' | 'chapter' | 'category'; id: string; title: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const [storiesResponse, chaptersResponse, categoriesResponse] = await Promise.all([
        storyService.getStories(),
        storyService.getAllChapters(),
        storyService.getCategories()
      ]);
      
      setStories(storiesResponse.stories);
      setChapters(chaptersResponse.chapters);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteStory = async (storyId: string, storyTitle: string) => {
    setDeleteConfirm({ type: 'story', id: storyId, title: storyTitle });
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    setDeleteConfirm({ type: 'chapter', id: chapterId, title: chapterTitle });
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    setDeleteConfirm({ type: 'category', id: categoryId, title: categoryName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(deleteConfirm.id);
      
      if (deleteConfirm.type === 'story') {
        await storyService.deleteStory(deleteConfirm.id);
        setNotification({ 
          type: 'success', 
          message: 'Đã xóa truyện và tất cả chương liên quan thành công!' 
        });
      } else if (deleteConfirm.type === 'chapter') {
        await storyService.deleteChapter(deleteConfirm.id);
        setNotification({ 
          type: 'success', 
          message: 'Đã xóa chương thành công!' 
        });
      } else if (deleteConfirm.type === 'category') {
        await storyService.deleteCategory(deleteConfirm.id);
        setNotification({ 
          type: 'success', 
          message: 'Đã xóa thể loại thành công!' 
        });
      }
      
      // Reload data after deletion
      await loadDashboardData();
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete:', err);
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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Quản lý truyện, chương và thể loại
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stories.length}</div>
            <div className="text-sm text-blue-700">📚 Truyện</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{chapters.length}</div>
            <div className="text-sm text-green-700">📖 Chương</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-purple-700">🏷️ Thể Loại</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {stories.filter(s => s.status === 'public').length}
            </div>
            <div className="text-sm text-yellow-700">✅ Đã Xuất Bản</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {stories.filter(s => s.status === 'draft').length}
            </div>
            <div className="text-sm text-red-700">📝 Bản Thảo</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Thao Tác Nhanh</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/admin/new-story"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Truyện Mới
              </Link>
              <Link 
                href="/admin/new-chapter"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Chương Mới
              </Link>
              <Link
                href="/stories"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Xem Trang Công Khai
              </Link>
            </div>
          </div>
        </div>

        {/* Stories Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">📚 Danh Sách Truyện</h2>
              <Link
                href="/admin/new-story"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
              >
                ✨ Tạo Truyện Mới
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Truyện
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thể Loại
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stories.map((story) => (
                  <tr key={story._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {story.coverImage ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={story.coverImage} alt={story.title} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">📚</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{story.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{story.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {story.category.slice(0, 2).map((catId) => {
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
                        {story.category.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{story.category.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.status === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {story.status === 'public' ? '✅ Đã xuất bản' : '📝 Bản thảo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/admin/stories/${story._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteStory(story._id, story.title)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                          disabled={isDeleting === story._id}
                        >
                          {isDeleting === story._id ? 'Đang xóa...' : '🗑️ Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">🏷️ Danh Sách Thể Loại</h2>
              <Link
                href="/admin/new-category"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full sm:w-auto justify-center"
              >
                ✨ Tạo Thể Loại Mới
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thể Loại
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô Tả
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số Truyện
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => {
                  const storyCount = stories.filter(story => 
                    story.category.includes(category._id)
                  ).length;
                  
                  return (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.description || 'Không có mô tả'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {storyCount} truyện
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link
                            href={`/admin/categories/${category._id}/edit`}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                          >
                            ✏️ Sửa
                          </Link>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                            disabled={isDeleting === category._id}
                          >
                            {isDeleting === category._id ? 'Đang xóa...' : '🗑️ Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">📖 Danh Sách Chương</h2>
              <Link
                href="/admin/new-chapter"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto justify-center"
              >
                ✨ Tạo Chương Mới
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chương
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Truyện
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mr-3">
                          {chapter.chapterNumber}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{chapter.title}</div>
                          {chapter.content && (
                            <div className="text-xs text-gray-500">
                              {Math.ceil(chapter.content.length / 1000)} nghìn từ
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof chapter.storyId === 'string'
                        ? 'Truyện đã bị xóa'
                        : chapter.storyId?.title || 'Truyện đã bị xóa'
                      }
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/admin/chapters/${chapter._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                          disabled={isDeleting === chapter._id}
                        >
                          {isDeleting === chapter._id ? 'Đang xóa...' : '🗑️ Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 border w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-red-500 w-12 h-12 dark:text-red-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Bạn có chắc chắn muốn xóa "{deleteConfirm.title}" không?
                </h3>
                {deleteConfirm.type === 'story' && (
                  <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    ⚠️ <strong>Lưu ý:</strong> Khi xóa truyện này, tất cả các chương liên quan cũng sẽ bị xóa vĩnh viễn!
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmDelete}
                    className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    disabled={isDeleting === deleteConfirm.id}
                  >
                    {isDeleting === deleteConfirm.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-500 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-800"
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
        <div className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm mx-auto sm:mx-0`}>
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <span className="text-green-400 text-lg">✅</span>
                ) : (
                  <span className="text-red-400 text-lg">❌</span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === 'success' 
                      ? 'text-green-400 hover:bg-green-100' 
                      : 'text-red-400 hover:bg-red-100'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600`}
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
