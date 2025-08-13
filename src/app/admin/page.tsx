'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, FileText, CheckCircle, Edit3, Trash2, AlertTriangle, Tag, Plus, Settings, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 lg:pt-32 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight flex items-center gap-3">
                <Settings size={32} className="text-blue-400" />
                Bảng Điều Khiển Quản Trị
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Quản lý truyện, chương và thể loại
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/stories"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <BookOpen size={16} />
                Xem Trang Web
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <Mail size={16} />
                Trang Liên Hệ
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                <Home size={18} />
              Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-blue-900/20 rounded-lg p-3 sm:p-4 text-center border border-blue-800">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{stories.length}</div>
                            <div className="text-xs sm:text-sm text-blue-300 flex items-center justify-center gap-1">
                  <BookOpen size={14} />
                  Truyện
                </div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3 sm:p-4 text-center border border-green-800">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{chapters.length}</div>
                            <div className="text-xs sm:text-sm text-green-300 flex items-center justify-center gap-1">
                  <FileText size={14} />
                  Chương
                </div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 text-center border border-purple-800">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">{categories.length}</div>
            <div className="text-xs sm:text-sm text-purple-300 flex items-center justify-center gap-1">
              <Tag size={14} />
              Thể Loại
            </div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3 sm:p-4 text-center border border-yellow-800">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400">
              {stories.filter(s => s.status === 'public').length}
            </div>
                            <div className="text-xs sm:text-sm text-yellow-300 flex items-center justify-center gap-1">
                  <CheckCircle size={14} />
                  Đã Xuất Bản
                </div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-3 sm:p-4 text-center border border-red-800">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400">
              {stories.filter(s => s.status === 'draft').length}
            </div>
                            <div className="text-xs sm:text-sm text-red-300 flex items-center justify-center gap-1">
                  <Edit3 size={14} />
                  Bản Thảo
                </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-900 rounded-lg shadow mb-6 sm:mb-8 border border-gray-800">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg font-medium text-white">Thao Tác Nhanh</h2>
          </div>
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link 
                href="/admin/new-story"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Truyện Mới
              </Link>
              <Link 
                href="/admin/new-chapter"
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Chương Mới
              </Link>
              <Link
                href="/stories"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-colors duration-200"
              >
                Xem Trang Công Khai
              </Link>
            </div>
          </div>
        </div>

        {/* Stories Table */}
        <div className="bg-gray-900 rounded-lg shadow mb-6 sm:mb-8 border border-gray-800">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BookOpen size={20} />
                Danh Sách Truyện
              </h2>
                              <Link
                  href="/admin/new-story"
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center gap-2"
                >
                  <Plus size={18} />
                  Tạo Truyện Mới
                </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Truyện
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Thể Loại
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Ngày Tạo
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {stories.map((story) => (
                  <tr key={story._id} className="hover:bg-gray-800">
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          {story.coverImage ? (
                            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" src={story.coverImage} alt={story.title} />
                          ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <BookOpen size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-white truncate">{story.title}</div>
                          <div className="text-xs sm:text-sm text-gray-300 truncate">{story.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
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
                          <span className="text-xs text-gray-400">
                            +{story.category.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.status === 'public' 
                          ? 'bg-green-900/20 text-green-400 border border-green-700' 
                          : 'bg-yellow-900/20 text-yellow-400 border border-yellow-700'
                      }`}>
                        {story.status === 'public' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-900/20 text-green-400 border border-green-700">
                      <CheckCircle size={12} />
                      Đã xuất bản
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-900/20 text-red-400 border border-red-700">
                      <Edit3 size={12} />
                      Bản thảo
                    </span>
                  )}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-xs sm:text-sm text-gray-300">
                        {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Link
                          href={`/admin/stories/${story._id}/edit`}
                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <Edit3 size={16} />
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteStory(story._id, story.title)}
                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                          Xóa
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
        <div className="bg-gray-900 rounded-lg shadow mb-6 sm:mb-8 border border-gray-800">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Tag size={20} />
                Danh Sách Thể Loại
              </h2>
              <Link
                href="/admin/new-category"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full sm:w-auto justify-center"
              >
                <Plus size={18} />
                Tạo Thể Loại Mới
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thể Loại
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Mô Tả
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Số Truyện
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {categories.map((category) => {
                  const storyCount = stories.filter(story => 
                    story.category.includes(category._id)
                  ).length;
                  
                  return (
                    <tr key={category._id} className="hover:bg-gray-800">
                      <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-xs sm:text-sm font-medium text-white truncate">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-300 truncate">
                          {category.description || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
                          {storyCount} truyện
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                            Xóa
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
        <div className="bg-gray-900 rounded-lg shadow mb-6 sm:mb-8 border border-gray-800">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <FileText size={20} />
                Danh Sách Chương
              </h2>
              <Link
                href="/admin/new-chapter"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto justify-center"
              >
                <Plus size={18} />
                Tạo Chương Mới
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Chương
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Truyện
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Ngày Tạo
                  </th>
                  <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-gray-800">
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-900/20 text-blue-400 text-xs sm:text-sm font-medium rounded-full mr-2 sm:mr-3 border border-blue-700">
                          {chapter.chapterNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-white truncate">{chapter.title}</div>
                          {chapter.content && (
                            <div className="text-xs text-gray-300">
                              {Math.ceil(chapter.content.length / 1000)} nghìn từ
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-xs sm:text-sm text-gray-300 truncate">
                        {typeof chapter.storyId === 'string'
                          ? 'Truyện đã bị xóa'
                          : chapter.storyId?.title || 'Truyện đã bị xóa'
                        }
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-xs sm:text-sm text-gray-300">
                        {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Link
                          href={`/admin/chapters/${chapter._id}/edit`}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <Edit3 size={16} />
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                          Xóa
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
            <div className="relative bg-gray-900 rounded-lg shadow border border-gray-800">
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-red-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-white">
                  Bạn có chắc chắn muốn xóa "{deleteConfirm.title}" không?
                </h3>
                {deleteConfirm.type === 'story' && (
                  <p className="mb-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-md border border-red-700">
                    <AlertTriangle size={16} className="inline mr-2" />
                  <strong>Lưu ý:</strong> Khi xóa truyện này, tất cả các chương liên quan cũng sẽ bị xóa vĩnh viễn!
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmDelete}
                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    disabled={isDeleting === deleteConfirm.id}
                  >
                    {isDeleting === deleteConfirm.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-gray-600"
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
              ? 'bg-green-900/20 border border-green-700 text-green-400' 
              : 'bg-red-900/20 border border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <AlertTriangle size={20} className="text-red-400" />
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
                      ? 'text-green-400 hover:bg-green-900/20' 
                      : 'text-red-400 hover:bg-red-900/20'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-600`}
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
