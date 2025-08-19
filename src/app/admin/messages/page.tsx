'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Edit3, Trash2, ArrowLeft, User, Clock, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Navigation from '../../../component/Navigation';
import { storyService } from '../../../services/storyService';
import { Message } from '../../../types/story';

export default function AdminMessages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
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
      const response = await storyService.getMessages();
      setMessages(response.messages);
    } catch (err) {
      console.error('Failed to load data:', err);
      setNotification({ 
        type: 'error', 
        message: 'Không thể tải dữ liệu tin nhắn!' 
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, name: string) => {
    setDeleteConfirm({ id: messageId, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(deleteConfirm.id);
      
      // Mock delete - replace with actual API call
      setMessages(prev => prev.filter(msg => msg._id !== deleteConfirm.id));
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa tin nhắn thành công!' 
      });
      
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete message:', err);
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

  const getStatusBadge = (message: Message) => {
    if (message.reply) {
      return (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-[#F4A460]/20 text-[#F4A460] border border-[#F4A460]/50">
          <span className="hidden sm:inline">Đã trả lời</span>
          <span className="sm:hidden">Đã TL</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-[#E9967A]/20 text-[#E9967A] border border-[#E9967A]/50">
          <span className="hidden sm:inline">Chưa trả lời</span>
          <span className="sm:hidden">Chưa TL</span>
        </span>
      );
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !msg.reply).length;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full px-4 sm:px-6 lg:8 py-4 sm:py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin" className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-md bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700">
              <ArrowLeft size={18} className="sm:w-5" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-md flex items-center justify-center shadow-md">
                  <Mail size={16} className="sm:w-5 text-white" />
                </div>
                <div className="absolute -top-1 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="relative mb-1">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">Góc Truyện</h1>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                    Quản lý tin nhắn
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-400">Tổng tin nhắn</p>
              <p className="text-lg sm:text-xl font-bold text-pink-400">{messages.length}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs sm:text-sm font-medium text-white">N</span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3 sm:space-y-4 px-1 sm:px-4">
          {messages.map((message) => (
            <div key={message._id} className="bg-gray-800/50 rounded-md border border-gray-700 p-3 sm:p-4 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-200 hover:scale-102">
              <div className="flex items-start gap-2 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.guestPicture ? (
                    <img 
                      src={message.guestPicture} 
                      alt={message.guestName || message.name}
                      className="h-10 w-10 sm:h-16 sm:w-16 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback avatar */}
                  <div className={`h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ${message.guestPicture ? 'hidden' : ''}`}>
                    <User size={14} className="text-white sm:w-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-1 sm:mb-2">
                        {message.guestName || message.name}
                      </h3>
                      
                      {/* Subject - Hidden on mobile */}
                      <p className="hidden sm:block text-sm text-gray-300 mb-2">
                        {message.content.substring(0, 100)}...
                      </p>
                      
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Calendar size={12} className="sm:w-4" />
                        <span>{new Date(message.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {getStatusBadge(message)}
                    </div>
                  </div>

                  {/* Subject - Mobile */}
                  <div className="sm:hidden mt-2">
                    <p className="text-xs text-gray-400 truncate">
                      {message.content.substring(0, 50)}...
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <Link
                      href={`/admin/messages/${message._id}`}
                      className="inline-flex items-center justify-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                    >
                      <MessageSquare size={12} className="sm:w-4" />
                      <span className="hidden sm:inline">Xem</span>
                      <span className="sm:hidden">Xem</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteMessage(message._id, message.name)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
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
        {messages.length === 0 && !isLoadingData && (
          <div className="text-center py-6 sm:py-8">
            <Mail size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Chưa có tin nhắn nào</h3>
            <p className="text-sm text-gray-500 mb-6">Chưa có tin nhắn nào trong hộp thư</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 px-1 sm:px-4">
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-yellow-400">Quản lý tin nhắn</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-yellow-300 space-y-1">
                  <p>• Tin nhắn chưa đọc sẽ được đánh dấu màu đỏ</p>
                  <p>• Đánh dấu "Đã trả lời" khi bạn đã phản hồi người gửi</p>
                  <p>• Xóa tin nhắn không còn cần thiết để giữ gọn hộp thư</p>
                  <p>• Bấm "Xem" để xem chi tiết tin nhắn và trả lời</p>
                  <p>• Guest có thể trả lời lẫn nhau tạo thành thread comment</p>
                  <p>• Quản lý và xóa các câu trả lời của guest trên trang chi tiết</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {/* This section is no longer needed as the detail page is a separate route */}

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
                  Bạn có chắc chắn muốn xóa tin nhắn "{deleteConfirm.name}" không?
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
