'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Edit3, Trash2, Plus, ArrowLeft, BookOpen, Calendar, Hash } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { Chapter, Story } from '../../../types/story';
import Navigation from '../../../component/Navigation';

export default function AdminChapters() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
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
      const [chaptersResponse, storiesResponse] = await Promise.all([
        storyService.getAllChapters(),
        storyService.getStories()
      ]);
      
      setChapters(chaptersResponse.chapters);
      setStories(storiesResponse.stories);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    setDeleteConfirm({ id: chapterId, title: chapterTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(deleteConfirm.id);
      await storyService.deleteChapter(deleteConfirm.id);
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa chương thành công!' 
      });
      
      // Reload data after deletion
      await loadData();
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete chapter:', err);
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

  const getStoryTitle = (storyId: string) => {
    const story = stories.find(s => s._id === storyId);
    return story ? story.title : 'Truyện đã bị xóa';
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
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
                className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
              >
                <ArrowLeft size={18} className="text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <FileText size={24} className="text-green-400" />
                  <span className="hidden sm:inline">Quản Lý Chương</span>
                  <span className="sm:hidden">Chương</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Tổng cộng {chapters.length} chương
                </p>
              </div>
            </div>
            <Link
              href="/admin/new-chapter"
              className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={16} className="sm:w-[18px]" />
              <span className="hidden sm:inline">Tạo Chương Mới</span>
              <span className="sm:hidden">Tạo Chương</span>
            </Link>
          </div>
        </div>

        {/* Chapters List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="bg-gray-900 rounded-lg border border-gray-800 p-4 sm:p-6 hover:bg-gray-800 transition-colors duration-200">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Chapter Number */}
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-900/20 text-green-400 text-sm sm:text-lg font-medium rounded-full border border-green-700">
                    <Hash size={16} className="sm:w-5" />
                    <span className="ml-1">{chapter.chapterNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-1 sm:mb-2">
                        {chapter.title}
                      </h3>
                      
                      {/* Story Title */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-2">
                        <BookOpen size={14} className="sm:w-4" />
                        <span className="truncate">{getStoryTitle(chapter.storyId as string)}</span>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Calendar size={14} className="sm:w-4" />
                        <span>{new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Word Count - Hidden on mobile */}
                    <div className="hidden sm:flex flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
                        {chapter.content ? Math.ceil(chapter.content.length / 1000) : 0} nghìn từ
                      </span>
                    </div>
                  </div>

                  {/* Word Count - Mobile */}
                  <div className="sm:hidden mt-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
                      {chapter.content ? Math.ceil(chapter.content.length / 1000) : 0} nghìn từ
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <Link
                      href={`/admin/chapters/${chapter._id}/edit`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Edit3 size={14} className="sm:w-4" />
                      <span className="hidden sm:inline">Sửa</span>
                      <span className="sm:hidden">Sửa</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <Trash2 size={14} className="sm:w-4" />
                      <span className="hidden sm:inline">Xóa</span>
                      <span className="sm:hidden">Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {chapters.length === 0 && !isLoadingData && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Chưa có chương nào</h3>
            <p className="text-sm text-gray-500 mb-6">Bắt đầu tạo chương đầu tiên của bạn</p>
            <Link
              href="/admin/new-chapter"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Tạo Chương Mới
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-md max-h-full">
            <div className="relative bg-gray-900 rounded-lg shadow border border-gray-800">
              <div className="p-4 sm:p-6 text-center">
                <svg className="mx-auto mb-4 text-red-400 w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-3 sm:mb-5 text-base sm:text-lg font-normal text-white">
                  Bạn có chắc chắn muốn xóa "{deleteConfirm.title}" không?
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
