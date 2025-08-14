'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../component/Navigation';
import { storyService } from '../../services/storyService';
import { CreateMessageRequest } from '../../types/story';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Info, LogIn, Clock, XCircle } from 'lucide-react';

interface MessageLimitInfo {
  email: string;
  todayMessageCount: number;
  date: string;
  limit: number;
}

export default function ContactPage() {
  const router = useRouter();
  const { guest, isAuthenticated: isGuestAuthenticated } = useGuest();
  const { user, isAuthenticated: isAdminAuthenticated } = useAuth();
  const [formData, setFormData] = useState<CreateMessageRequest>({
    name: '',
    email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [messageLimitInfo, setMessageLimitInfo] = useState<MessageLimitInfo | null>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  // Check if user is authenticated (either guest or admin)
  const isAuthenticated = isGuestAuthenticated || isAdminAuthenticated;

  // Auto-fill form with guest info if available
  useEffect(() => {
    if (guest && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: guest.displayName,
        email: guest.email
      }));
    }
  }, [guest, formData.name, formData.email]);

  // Check message limit when email changes
  useEffect(() => {
    if (formData.email && isAuthenticated) {
      checkMessageLimit(formData.email);
    }
  }, [formData.email, isAuthenticated]);

  const checkMessageLimit = async (email: string) => {
    if (!email) return;
    
    setIsCheckingLimit(true);
    try {
      const response = await fetch(`/api/messages/count-today?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setMessageLimitInfo(data);
      }
    } catch (error) {
      console.error('Error checking message limit:', error);
    } finally {
      setIsCheckingLimit(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    // Check if content exceeds 255 characters
    if (formData.content.length > 255) {
      setSubmitStatus('error');
      setErrorMessage('Tin nhắn không được vượt quá 255 ký tự');
      return;
    }

    // Check if user has reached daily limit
    if (messageLimitInfo && messageLimitInfo.todayMessageCount >= messageLimitInfo.limit) {
      setSubmitStatus('error');
      setErrorMessage('Bạn đã đạt giới hạn 5 tin nhắn mỗi ngày. Vui lòng thử lại vào ngày mai.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Add guest token if available
      const messageData: CreateMessageRequest = {
        ...formData,
        guestToken: guest ? guest.id : undefined
      };
      
      await storyService.sendMessage(messageData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', content: '' });
      
      // Refresh message limit info after successful send
      if (formData.email) {
        checkMessageLimit(formData.email);
      }
    } catch (err) {
      setSubmitStatus('error');
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('Daily message limit exceeded') || err.message.includes('429')) {
          setErrorMessage('Bạn đã đạt giới hạn 5 tin nhắn mỗi ngày. Vui lòng thử lại vào ngày mai.');
          // Refresh message limit info to show current count
          if (formData.email) {
            checkMessageLimit(formData.email);
          }
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to send message');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth');
  };

  // Check if user can send more messages
  const canSendMessage = messageLimitInfo ? messageLimitInfo.todayMessageCount < messageLimitInfo.limit : true;
  const remainingMessages = messageLimitInfo ? messageLimitInfo.limit - messageLimitInfo.todayMessageCount : 5;

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-16 md:pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail size={48} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Liên hệ với tôi</h1>
          </div>
          <p className="text-lg text-gray-300">
            Bạn có góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện? Hãy để lại tin nhắn cho tôi!
          </p>
        </div>

        <div className="bg-gray-900 shadow-lg rounded-lg p-8 border border-gray-800">
          {/* Authentication Required Notice */}
          {!isAuthenticated && (
            <div className="mb-6 bg-yellow-900/20 border border-yellow-700 text-yellow-400 px-4 py-3 rounded flex items-center gap-3">
              <AlertCircle size={20} />
              <div className="flex-1">
                <p className="font-medium">Bạn cần đăng nhập để gửi tin nhắn</p>
                <p className="text-sm mt-1">Tin nhắn sẽ được liên kết với tài khoản của bạn</p>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <LogIn size={16} />
                Đăng Nhập
              </button>
            </div>
          )}

          {/* Daily Limit Notice for Guests */}
          {isGuestAuthenticated && (
            <div className="mb-6 bg-blue-900/20 border border-blue-700 text-blue-400 px-4 py-3 rounded flex items-center gap-3">
              <Clock size={20} />
              <div>
                <p className="font-medium">Giới hạn tin nhắn hàng ngày</p>
                <p className="text-sm mt-1">Mỗi tài khoản Google chỉ được gửi tối đa 5 tin nhắn mỗi ngày</p>
              </div>
            </div>
          )}

          {/* Message Limit Status */}
          {isAuthenticated && messageLimitInfo && (
            <div className={`mb-6 border rounded px-4 py-3 flex items-center gap-3 ${
              canSendMessage 
                ? 'bg-green-900/20 border-green-700 text-green-400' 
                : 'bg-red-900/20 border-red-700 text-red-400'
            }`}>
              {canSendMessage ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <div>
                <p className="font-medium">
                  {canSendMessage ? 'Bạn có thể gửi tin nhắn' : 'Bạn đã đạt giới hạn tin nhắn hôm nay'}
                </p>
                <p className="text-sm mt-1">
                  {canSendMessage 
                    ? `Hôm nay bạn đã gửi ${messageLimitInfo.todayMessageCount}/5 tin nhắn. Còn lại ${remainingMessages} tin nhắn.`
                    : `Hôm nay bạn đã gửi ${messageLimitInfo.todayMessageCount}/5 tin nhắn. Vui lòng thử lại vào ngày mai.`
                  }
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="mb-6 bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded flex items-center gap-3">
              <CheckCircle size={20} />
              <div>
                <p className="font-medium">Tin nhắn đã được gửi thành công!</p>
                <p className="text-sm mt-1">Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded flex items-center gap-3">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">Không thể gửi tin nhắn</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User size={16} />
                Tên của bạn <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập tên của bạn"
                disabled={!isAuthenticated}
              />
            </div>

            {/* Email field - hidden for guests, shown for admins */}
            {!isGuestAuthenticated && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                  placeholder="your.email@example.com"
                  disabled={!isAuthenticated}
                />
              </div>
            )}

            {/* Guest email info */}
            {isGuestAuthenticated && (
              <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail size={16} />
                  <span>Email: <span className="text-blue-400">{guest?.email}</span></span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Email sẽ được tự động lấy từ tài khoản Google của bạn</p>
              </div>
            )}

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MessageSquare size={16} />
                Nội dung tin nhắn <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                maxLength={255}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                placeholder={isAuthenticated ? "Viết tin nhắn của bạn ở đây... (tối đa 255 ký tự)" : "Bạn cần đăng nhập để gửi tin nhắn"}
                disabled={!isAuthenticated}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">
                  Tin nhắn sẽ được hiển thị trên trang chủ
                </span>
                <span className={`text-xs ${formData.content.length >= 255 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formData.content.length}/255 ký tự
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={!isAuthenticated || isSubmitting || formData.content.length > 255 || !canSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {!isAuthenticated ? (
                  <>
                    <LogIn size={20} />
                    Cần Đăng Nhập
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang gửi...
                  </>
                ) : formData.content.length > 255 ? (
                  <>
                    <AlertCircle size={20} />
                    Vượt quá 255 ký tự
                  </>
                ) : !canSendMessage ? (
                  <>
                    <XCircle size={20} />
                    Đã đạt giới hạn hôm nay
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Gửi tin nhắn
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Info size={20} className="text-blue-400" />
              <h3 className="text-lg font-medium text-white">Thông tin liên hệ khác</h3>
            </div>
            <div className="text-gray-300 space-y-2">
              <p>• Bạn cũng có thể góp ý trực tiếp trong phần bình luận của từng chương</p>
              <p>• Tôi sẽ cố gắng phản hồi tất cả tin nhắn trong thời gian sớm nhất</p>
              <p>• Cảm ơn bạn đã dành thời gian đọc truyện của tôi!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
