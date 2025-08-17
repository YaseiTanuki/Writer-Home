'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, User, Trash2, Reply } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import Navigation from '../../../../component/Navigation';
import { storyService } from '../../../../services/storyService';
import { Message } from '../../../../types/story';

export default function MessageDetail() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const messageId = params.messageId as string;
  
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isDeletingGuestReply, setIsDeletingGuestReply] = useState<{ replyIndex: number } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Admin reply edit states
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState('');
  const [isUpdatingReply, setIsUpdatingReply] = useState(false);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && messageId) {
      loadMessage();
    }
  }, [isAuthenticated, messageId]);

  const loadMessage = async () => {
    try {
      setIsLoadingData(true);
      const response = await storyService.getMessages();
      const foundMessage = response.messages.find(msg => msg._id === messageId);
      if (foundMessage) {
        setMessage(foundMessage);
      } else {
        setNotification({ 
          type: 'error', 
          message: 'Không tìm thấy tin nhắn!' 
        });
        setTimeout(() => router.push('/admin/messages'), 2000);
      }
    } catch (err) {
      console.error('Failed to load message:', err);
      setNotification({ 
        type: 'error', 
        message: 'Không thể tải dữ liệu tin nhắn!' 
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !message) return;
    
    try {
      setIsReplying(true);
      const response = await storyService.replyMessage(message._id, replyText);
      console.log('Reply response:', response);
      
      // Reload message to get the latest state
      await loadMessage();
      
      setReplyText('');
      setNotification({ 
        type: 'success', 
        message: 'Đã trả lời tin nhắn thành công!' 
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to reply to message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi trả lời';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteGuestReply = async (replyIndex: number) => {
    if (!message) return;
    
    try {
      setIsDeletingGuestReply({ replyIndex });
      
      const response = await storyService.deleteGuestReply(message._id, replyIndex);
      console.log('Delete guest reply response:', response);
      
      // Reload message to get the latest state
      await loadMessage();
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa câu trả lời của guest thành công!' 
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete guest reply:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa câu trả lời';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeletingGuestReply(null);
    }
  };

  // Edit admin reply
  const handleEditReply = () => {
    if (message?.reply) {
      setEditReplyText(message.reply);
      setIsEditingReply(true);
    }
  };

  const handleUpdateReply = async () => {
    if (!editReplyText.trim() || !message) return;
    
    try {
      setIsUpdatingReply(true);
      const response = await storyService.replyMessage(message._id, editReplyText);
      console.log('Update reply response:', response);
      
      // Reload message to get the latest state
      await loadMessage();
      
      setIsEditingReply(false);
      setEditReplyText('');
      setNotification({ 
        type: 'success', 
        message: 'Đã cập nhật câu trả lời thành công!' 
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to update reply:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật câu trả lời';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdatingReply(false);
    }
  };

  const cancelEditReply = () => {
    setIsEditingReply(false);
    setEditReplyText('');
  };

  // Delete admin reply
  const handleDeleteReply = async () => {
    if (!message) return;
    
    // Show confirmation modal instead of browser confirm
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteReply = async () => {
    if (!message) return;
    
    try {
      setIsDeletingReply(true);
      const response = await storyService.replyMessage(message._id, ''); // Empty string to remove reply
      console.log('Delete reply response:', response);
      
      // Reload message to get the latest state
      await loadMessage();
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa câu trả lời của admin thành công!' 
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete reply:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa câu trả lời';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeletingReply(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const cancelDeleteReply = () => {
    setShowDeleteConfirm(false);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm">Đang tải tin nhắn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-300 text-lg">Không tìm thấy tin nhắn</p>
            <Link href="/admin/messages" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
              Quay lại danh sách tin nhắn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/messages" className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white transition-colors duration-200">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-400">Chi tiết tin nhắn</h1>
              <p className="text-sm text-gray-400">Xem và quản lý tin nhắn</p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.guestPicture ? (
                <img 
                  src={message.guestPicture} 
                  alt={message.guestName || message.name}
                  className="h-20 w-20 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ${message.guestPicture ? 'hidden' : ''}`}>
                <User size={24} className="text-white" />
              </div>
            </div>

            {/* Message Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-white mb-2">
                {message.guestName || message.name}
              </h2>
              <p className="text-gray-300 mb-2">{message.email}</p>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(message.createdAt).toLocaleString('vi-VN')}
              </p>
              
              {/* Content */}
              <div className="bg-gray-700 rounded-md p-4">
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Section */}
        {!message.reply ? (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-400">Trả lời tin nhắn</h3>
            </div>
            <div className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập nội dung trả lời..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isReplying}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200"
                >
                  {isReplying ? 'Đang gửi...' : 'Gửi trả lời'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-green-400">Trả lời của admin:</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditReply}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                >
                  Sửa
                </button>
                <button
                  onClick={handleDeleteReply}
                  disabled={isDeletingReply}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                >
                  {isDeletingReply ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
            
            {isEditingReply ? (
              <div className="space-y-4">
                <textarea
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  placeholder="Nhập nội dung trả lời..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelEditReply}
                    className="px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateReply}
                    disabled={!editReplyText.trim() || isUpdatingReply}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    {isUpdatingReply ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-md p-4">
                <p className="text-green-400 whitespace-pre-wrap">{message.reply}</p>
              </div>
            )}
          </div>
        )}

        {/* Guest Replies Section */}
        {message.guestReplies && message.guestReplies.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-400 mb-4">
              Câu trả lời của guests ({message.guestReplies.length})
            </h3>
            <div className="space-y-4">
              {/* Show first 3 guest replies */}
              {message.guestReplies.slice(0, 3).map((reply, index) => (
                <div key={reply._id || index} className="p-4 bg-blue-900/20 border border-blue-700 rounded-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-400">{reply.guestName}</span>
                        <span className="text-xs text-blue-300">({reply.guestEmail})</span>
                      </div>
                      <p className="text-blue-300 whitespace-pre-wrap mb-2">{reply.content}</p>
                      <div className="text-xs text-blue-300">
                        {new Date(reply.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGuestReply(index)}
                      disabled={isDeletingGuestReply?.replyIndex === index}
                      className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                      title="Xóa câu trả lời"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Show remaining guest replies in scrollable area if more than 3 */}
              {message.guestReplies.length > 3 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-blue-300">
                      Và {message.guestReplies.length - 3} câu trả lời khác:
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-blue-700 rounded-md bg-blue-900/10 p-3">
                    {message.guestReplies.slice(3).map((reply, index) => (
                      <div key={reply._id || (index + 3)} className="p-3 bg-blue-900/20 border border-blue-700 rounded-md mb-3 last:mb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-blue-400">{reply.guestName}</span>
                              <span className="text-xs text-blue-300">({reply.guestEmail})</span>
                            </div>
                            <p className="text-blue-300 whitespace-pre-wrap mb-2">{reply.content}</p>
                            <div className="text-xs text-blue-300">
                              {new Date(reply.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGuestReply(index + 3)}
                            disabled={isDeletingGuestReply?.replyIndex === (index + 3)}
                            className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                            title="Xóa câu trả lời"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/admin/messages"
            className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Quay lại danh sách tin nhắn
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="p-6">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-medium text-white text-center mb-2">
                Xác nhận xóa
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-300 text-center mb-6">
                Bạn có chắc chắn muốn xóa câu trả lời của admin không? Hành động này không thể hoàn tác.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteReply}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDeleteReply}
                  disabled={isDeletingReply}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                >
                  {isDeletingReply ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-900/20 border border-green-700 text-green-400' 
              : 'bg-red-900/20 border border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
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
