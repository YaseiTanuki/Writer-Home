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
  
  // Orphaned chapters deletion confirmation modal
  const [showOrphanedDeleteConfirm, setShowOrphanedDeleteConfirm] = useState(false);
  const [orphanedChaptersToDelete, setOrphanedChaptersToDelete] = useState<Chapter[]>([]);

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
  
  // Handle orphaned chapters deletion
  const confirmOrphanedDelete = async () => {
    if (!orphanedChaptersToDelete.length) return;
    
    try {
      // Delete all orphaned chapters
      await Promise.all(
        orphanedChaptersToDelete.map(chapter => 
          storyService.deleteChapter(chapter._id)
        )
      );
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Đã xóa ${orphanedChaptersToDelete.length} chương không liên kết thành công!`
      });
      
      // Reload data
      await loadData();
      
      // Close modal
      setShowOrphanedDeleteConfirm(false);
      setOrphanedChaptersToDelete([]);
      
      // Auto-hide notification
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Failed to delete orphaned chapters:', error);
      setNotification({
        type: 'error',
        message: 'Có lỗi xảy ra khi xóa các chương không liên kết!'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };
  
  const cancelOrphanedDelete = () => {
    setShowOrphanedDeleteConfirm(false);
    setOrphanedChaptersToDelete([]);
  };

  const getStoryTitle = (storyId: any) => {
    if (!storyId) return 'Không có truyện';
    
    // Xử lý trường hợp storyId là object (MongoDB ObjectId)
    let actualStoryId = storyId;
    if (typeof storyId === 'object' && storyId !== null) {
      // Nếu storyId là object, lấy _id từ nó
      if (storyId._id) {
        actualStoryId = storyId._id;
      } else {
        // Nếu không có _id, thử toString()
        actualStoryId = storyId.toString();
      }
    }
    
    // Thử tìm kiếm với nhiều cách khác nhau
    let story = stories.find(s => s._id === actualStoryId);
    
    if (!story) {
      // Thử với string conversion
      story = stories.find(s => String(s._id) === String(actualStoryId));
    }
    
    if (!story) {
      // Thử với toString() method
      story = stories.find(s => s._id.toString() === actualStoryId.toString());
    }
    
    if (!story) {
      // Thử với loose comparison
      story = stories.find(s => s._id == actualStoryId);
    }
    
    if (!story) {
      // Kiểm tra xem có phải do dữ liệu chưa load xong không
      if (isLoadingData) return 'Đang tải...';
      
      return 'Truyện không tồn tại';
    }
    
    return story.title;
  };

  // Helper function để extract storyId từ chapter
  const extractStoryId = (storyId: any): string => {
    if (!storyId) return '';
    
    if (typeof storyId === 'object' && storyId !== null) {
      if (storyId._id) {
        return storyId._id;
      } else {
        return storyId.toString();
      }
    }
    
    return String(storyId);
  };

  // Helper function để kiểm tra xem chương có liên kết với truyện không
  const isChapterLinkedToStory = (chapter: Chapter) => {
    if (!chapter.storyId) return false;
    
    const actualStoryId = extractStoryId(chapter.storyId);
    
    // Thử nhiều cách so sánh khác nhau
    const hasDirectMatch = stories.some(story => story._id === actualStoryId);
    if (hasDirectMatch) return true;
    
    const hasStringMatch = stories.some(story => String(story._id) === String(actualStoryId));
    if (hasStringMatch) return true;
    
    const hasToStringMatch = stories.some(story => story._id.toString() === actualStoryId.toString());
    if (hasToStringMatch) return true;
    
    const hasLooseMatch = stories.some(story => story._id == actualStoryId);
    return hasLooseMatch;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
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
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-1 sm:px-4 py-2 sm:py-6">
        {/* Header */}
        <div className="mb-2 sm:mb-6 px-1 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/admin"
                className="p-1 sm:p-2 rounded-md bg-[#1E1E1E] hover:bg-[#2A2A2A] transition-all duration-200 backdrop-blur-sm border-2 border-[#D2691E]/30 hover:border-[#D2691E]/50"
              >
                <ArrowLeft size={16} className="text-[#00E5FF] sm:w-[18px]" />
              </Link>
              <div>
                <div className="relative mb-1">
                  <h1 className="text-lg sm:text-xl font-bold text-[#FFFFFF] flex items-center gap-2 sm:gap-3">
                  <FileText size={20} className="text-[#00E5FF] sm:w-6" />
                  <span className="hidden sm:inline">Quản Lý Chương</span>
                  <span className="sm:hidden">Chương</span>
                </h1>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#D2691E] rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mt-0.5 sm:mt-1">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                    Tổng cộng {chapters.filter(c => (c.status || 'public') === 'public').length} chương
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3">
              {/* Clean up orphaned chapters button */}
              {chapters.some(chapter => !isChapterLinkedToStory(chapter)) && (
                <button
                  onClick={() => {
                    const orphanedChapters = chapters.filter(chapter => !isChapterLinkedToStory(chapter));
                    setOrphanedChaptersToDelete(orphanedChapters);
                    setShowOrphanedDeleteConfirm(true);
                  }}
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-2 sm:px-4 py-1.5 sm:py-3 rounded-md font-medium transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Trash2 size={14} className="sm:w-4" />
                  <span className="hidden sm:inline">Dọn dẹp chương lỗi</span>
                  <span className="sm:hidden">Dọn dẹp</span>
                </button>
              )}
              <Link
                href="/admin/new-chapter"
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-2 sm:px-6 py-1.5 sm:py-3 rounded-md font-medium transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg hover:scale-105"
              >
                <Plus size={14} className="sm:w-4" />
                <span className="hidden sm:inline">Tạo Chương Mới</span>
                <span className="sm:hidden">Tạo Chương</span>
              </Link>
            </div>
          </div>
        </div>



        {/* Chapters List - Mobile Optimized */}
        <div className="space-y-2 sm:space-y-4">
          {/* Warning for orphaned chapters */}
          {chapters.some(chapter => !isChapterLinkedToStory(chapter)) && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-md p-2 sm:p-4 backdrop-blur-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5"></div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-yellow-400">Cảnh báo</h3>
                  <div className="mt-0.5 sm:mt-2 text-xs sm:text-sm text-yellow-300">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                      Có một số chương không liên kết với truyện nào. Vui lòng kiểm tra và xóa các chương này để tránh lỗi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {chapters.map((chapter) => (
            <div key={chapter._id} className="bg-gray-900/50 rounded-md border border-gray-700 p-3 sm:p-6 hover:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:scale-102">
              <div className="flex items-start gap-2 sm:gap-4">
                {/* Chapter Number */}
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-green-900/20 text-green-400 text-sm sm:text-lg font-medium rounded-full border border-green-700">
                    <Hash size={14} className="sm:w-5" />
                    <span className="ml-0.5 sm:ml-1">{chapter.chapterNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                                     <div className="flex items-start justify-between gap-1.5 sm:gap-4 mb-1.5 sm:mb-2">
                     <div className="flex-1 min-w-0">
                       <h3 className="text-sm sm:text-lg font-semibold text-white truncate">
                         {chapter.title}
                       </h3>
                     </div>

                     {/* Word Count - Always visible on right side */}
                     <div className="flex flex-shrink-0">
                       <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-pink-900/20 text-pink-400 border border-pink-700">
                         {chapter.content ? Math.ceil(chapter.content.length / 1000) : 0} nghìn từ
                       </span>
                     </div>
                   </div>
                   
                   {/* Story Title */}
                   <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                     <BookOpen size={12} className="sm:w-4" />
                     <span className={`truncate ${
                       !isChapterLinkedToStory(chapter)
                         ? 'text-red-400' 
                         : 'text-gray-400'
                     }`}>
                       {getStoryTitle(chapter.storyId)}
                     </span>
                   </div>
                   
                   {/* Status */}
                   <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                     <div className={`w-2 h-2 rounded-full ${
                       (chapter.status || 'public') === 'public' ? 'bg-green-400' : 'bg-yellow-400'
                     }`}></div>
                     <span className={(chapter.status || 'public') === 'public' ? 'text-green-400' : 'text-yellow-400'}>
                       {(chapter.status || 'public') === 'public' ? 'Công khai' : 'Bản nháp'}
                     </span>
                   </div>
                   
                   {/* Date */}
                   <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400">
                     <Calendar size={12} className="sm:w-4" />
                     <span>{new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
                   </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-3 mt-2 sm:mt-4">
                    <Link
                      href={`/admin/chapters/${chapter._id}/edit`}
                      className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                    >
                      <Edit3 size={12} className="sm:w-4" />
                      <span className="hidden sm:inline">Sửa</span>
                      <span className="sm:hidden">Sửa</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                      className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <Trash2 size={12} className="sm:w-4" />
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
          <div className="text-center py-8 sm:py-12">
            <FileText size={40} className="mx-auto text-gray-600 mb-3 sm:mb-4 sm:w-12" />
            <h3 className="text-base sm:text-lg font-medium text-gray-400 mb-1.5 sm:mb-2">Chưa có chương nào</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Bắt đầu tạo chương đầu tiên của bạn</p>
            <Link
              href="/admin/new-chapter"
              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-sm"
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

      {/* Orphaned Chapters Deletion Confirmation Modal */}
      {showOrphanedDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-md max-h-full">
            <div className="relative bg-gray-900 rounded-lg shadow border border-gray-800">
              <div className="p-4 sm:p-6 text-center">
                <svg className="mx-auto mb-4 text-red-400 w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-3 sm:mb-5 text-base sm:text-lg font-normal text-white">
                  Xác nhận xóa chương không liên kết
                </h3>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-300">
                  Bạn có chắc chắn muốn xóa {orphanedChaptersToDelete.length} chương không liên kết với truyện nào không? Hành động này không thể hoàn tác.
                </p>
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-xs text-red-300 mb-2">Các chương sẽ bị xóa:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {orphanedChaptersToDelete.map((chapter, index) => (
                      <div key={chapter._id} className="text-xs text-red-200 bg-red-900/30 p-2 rounded">
                        {index + 1}. {chapter.title} (Chương {chapter.chapterNumber})
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <button
                    onClick={confirmOrphanedDelete}
                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center"
                  >
                    Xóa tất cả
                  </button>
                  <button
                    onClick={cancelOrphanedDelete}
                    className="text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center border border-gray-600"
                  >
                    Hủy bỏ
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
