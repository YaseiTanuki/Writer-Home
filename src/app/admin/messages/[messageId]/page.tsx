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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-3 text-gray-300 text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-3 text-gray-300 text-xs">Đang tải tin nhắn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-300 text-base">Không tìm thấy tin nhắn</p>
            <Link href="/admin/messages" className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm">
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/messages" className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-white transition-colors duration-200">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-400">Chi tiết tin nhắn</h1>
              <p className="text-xs text-gray-400">Xem và quản lý tin nhắn</p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.guestPicture ? (
                <img 
                  src={message.guestPicture} 
                  alt={message.guestName || message.name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ${message.guestPicture ? 'hidden' : ''}`}>
                <User size={20} className="text-white" />
              </div>
            </div>

            {/* Message Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-white mb-1">
                {message.guestName || message.name}
              </h2>
              <p className="text-gray-300 text-sm mb-1">{message.email}</p>
              <p className="text-xs text-gray-400 mb-3">
                {new Date(message.createdAt).toLocaleString('vi-VN')}
              </p>
              
              {/* Content */}
              <div className="bg-gray-700 rounded-md p-3">
                <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Section */}
        {!message.reply ? (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-base font-medium text-yellow-400">Trả lời tin nhắn</h3>
            </div>
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập nội dung trả lời..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isReplying}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
                >
                  {isReplying ? 'Đang gửi...' : 'Gửi trả lời'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-green-400">Trả lời của admin:</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditReply}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                >
                  Sửa
                </button>
                <button
                  onClick={handleDeleteReply}
                  disabled={isDeletingReply}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors duration-200"
                >
                  {isDeletingReply ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
            
            {isEditingReply ? (
              <div className="space-y-3">
                <textarea
                  value={editReplyText}
                  onChange={(e) => setEditReplyText(e.target.value)}
                  placeholder="Nhập nội dung trả lời..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEditReply}
                    className="px-3 py-1.5 border border-gray-600 text-gray-300 text-xs font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateReply}
                    disabled={!editReplyText.trim() || isUpdatingReply}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors duration-200"
                  >
                    {isUpdatingReply ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-md p-3">
                <p className="text-green-400 text-sm whitespace-pre-wrap">{message.reply}</p>
              </div>
            )}
          </div>
        )}

        {/* Guest Replies Section */}
        {message.guestReplies && message.guestReplies.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h3 className="text-base font-medium text-blue-400 mb-3">
              Câu trả lời của guests ({message.guestReplies.length})
            </h3>
            <div className="space-y-3">
              {/* Show first 3 guest replies */}
              {message.guestReplies.slice(0, 3).map((reply, index) => (
                <div key={reply._id || index} className="p-3 bg-blue-900/20 border border-blue-700 rounded-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-400">{reply.guestName}</span>
                        <span className="text-xs text-blue-300">({reply.guestEmail})</span>
                      </div>
                      <p className="text-blue-300 text-sm whitespace-pre-wrap mb-1">{reply.content}</p>
                      <div className="text-xs text-blue-300">
                        {new Date(reply.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGuestReply(index)}
                      disabled={isDeletingGuestReply?.replyIndex === index}
                      className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                      title="Xóa câu trả lời"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Show remaining guest replies in scrollable area if more than 3 */}
              {message.guestReplies.length > 3 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-300">
                      Và {message.guestReplies.length - 3} câu trả lời khác:
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-blue-700 rounded-md bg-blue-900/10 p-2">
                    {message.guestReplies.slice(3).map((reply, index) => (
                      <div key={reply._id || (index + 3)} className="p-2 bg-blue-900/20 border border-blue-700 rounded-md mb-2 last:mb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-400">{reply.guestName}</span>
                              <span className="text-xs text-blue-300">({reply.guestEmail})</span>
                            </div>
                            <p className="text-blue-300 text-sm whitespace-pre-wrap mb-1">{reply.content}</p>
                            <div className="text-xs text-blue-300">
                              {new Date(reply.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGuestReply(index + 3)}
                            disabled={isDeletingGuestReply?.replyIndex === (index + 3)}
                            className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors duration-200"
                            title="Xóa câu trả lời"
                          >
                            <Trash2 size={12} />
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
        <div className="flex justify-center mt-6">
          <Link
            href="/admin/messages"
            className="px-4 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Quay lại danh sách tin nhắn
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-sm w-full">
            <div className="p-4">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-900/20 mb-3">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-base font-medium text-white text-center mb-2">
                Xác nhận xóa
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-300 text-center mb-4">
                Bạn có chắc chắn muốn xóa câu trả lời của admin không? Hành động này không thể hoàn tác.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={cancelDeleteReply}
                  className="flex-1 px-3 py-2 border border-gray-600 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDeleteReply}
                  disabled={isDeletingReply}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
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
          <div className={`rounded-lg shadow-lg p-3 ${
            notification.type === 'success' 
              ? 'bg-green-900/20 border border-green-700 text-green-400' 
              : 'bg-red-900/20 border border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
