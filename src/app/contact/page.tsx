'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../component/Navigation';
import { storyService } from '../../services/storyService';
import { CreateMessageRequest } from '../../types/story';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Info, LogIn, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';

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
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  // Set page loading to false after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000); // Show loading for 1 second

    return () => clearTimeout(timer);
  }, []);

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

  // Loading screen
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6">
            <Image
              src="/reading.gif"
              alt="Loading..."
              width={96}
              height={96}
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
          <h2 className="text-sm md:text-2xl font-bold text-[#FFFFFF] mb-2">Đang tải...</h2>
          <p className="text-xs md:text-base text-[#B0BEC5]">Vui lòng chờ một chút</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation />
      <div className="pt-16 md:pt-24 max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
              <Mail size={24} className="text-[#FF4081]" />
              <h1 className="text-lg sm:text-xl font-bold text-[#FFFFFF]">Liên hệ với tôi</h1>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FFEB3B] rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs sm:text-sm text-[#B0BEC5]">
            Bạn có góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện? Hãy để lại tin nhắn cho tôi!
          </p>
        </div>

        <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#FF4081] shadow-[0_0_8px_#FF4081] backdrop-blur-sm">
          {/* Authentication Required Notice */}
          {!isAuthenticated && (
            <div className="mb-6 bg-[#FFEB3B]/10 border-2 border-[#FFEB3B]/30 text-[#FFEB3B] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 bg-[#FFEB3B] rounded-full"></div>
              <AlertCircle size={16} className="text-[#FFEB3B]" />
              <div className="flex-1">
                <p className="text-xs font-medium">Bạn cần đăng nhập để gửi tin nhắn</p>
                <p className="text-xs mt-1 text-[#FFEB3B]/80">Tin nhắn sẽ được liên kết với tài khoản của bạn</p>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="bg-[#FFEB3B] hover:bg-[#FFEB3B]/90 text-[#1E1E1E] px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <LogIn size={14} />
                Đăng Nhập
              </button>
            </div>
          )}

          {/* Daily Limit Notice for Guests */}
          {isGuestAuthenticated && (
            <div className="mb-6 bg-[#00E5FF]/10 border-2 border-[#00E5FF]/30 text-[#00E5FF] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
              <Clock size={16} className="text-[#00E5FF]" />
              <div>
                <p className="text-xs font-medium">Giới hạn tin nhắn hàng ngày</p>
                <p className="text-xs mt-1 text-[#00E5FF]/80">Mỗi tài khoản Google chỉ được gửi tối đa 5 tin nhắn mỗi ngày</p>
              </div>
            </div>
          )}

          {/* Message Limit Status */}
          {isAuthenticated && messageLimitInfo && (
            <div className={`mb-6 border-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 ${
              canSendMessage 
                ? 'bg-[#1DE9B6]/10 border-[#1DE9B6]/30 text-[#1DE9B6]' 
                : 'bg-[#FF4081]/10 border-[#FF4081]/30 text-[#FF4081]'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${canSendMessage ? 'bg-[#1DE9B6]' : 'bg-[#FF4081]'}`}></div>
              {canSendMessage ? (
                <CheckCircle size={16} className="text-[#1DE9B6]" />
              ) : (
                <XCircle size={16} className="text-[#FF4081]" />
              )}
              <div>
                <p className="text-xs font-medium">
                  {canSendMessage ? 'Bạn có thể gửi tin nhắn' : 'Bạn đã đạt giới hạn tin nhắn hôm nay'}
                </p>
                <p className="text-xs mt-1">
                  {canSendMessage 
                    ? `Hôm nay bạn đã gửi ${messageLimitInfo.todayMessageCount}/5 tin nhắn. Còn lại ${remainingMessages} tin nhắn.`
                    : `Hôm nay bạn đã gửi ${messageLimitInfo.todayMessageCount}/5 tin nhắn. Vui lòng thử lại vào ngày mai.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Loading indicator for message limit check */}
          {isCheckingLimit && (
            <div className="mb-6 bg-[#00E5FF]/10 border-2 border-[#00E5FF]/30 text-[#00E5FF] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse"></div>
              <div className="relative w-4 h-4 md:w-5 md:h-5">
                <Image
                  src="/reading.gif"
                  alt="Checking..."
                  width={16}
                  height={16}
                  className="rounded w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-medium">Đang kiểm tra giới hạn tin nhắn...</p>
                <p className="text-xs mt-1 text-[#00E5FF]/80">Vui lòng chờ một chút</p>
              </div>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="mb-6 bg-[#1DE9B6]/10 border-2 border-[#1DE9B6]/30 text-[#1DE9B6] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 bg-[#1DE9B6] rounded-full"></div>
              <CheckCircle size={16} className="text-[#1DE9B6]" />
              <div>
                <p className="text-xs font-medium">Tin nhắn đã được gửi thành công!</p>
                <p className="text-xs mt-1 text-[#1DE9B6]/80">Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 bg-[#FF4081]/10 border-2 border-[#FF4081]/30 text-[#FF4081] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 bg-[#FF4081] rounded-full"></div>
              <AlertCircle size={16} className="text-[#FF4081]" />
              <div>
                <p className="text-xs font-medium">Không thể gửi tin nhắn</p>
                <p className="text-xs mt-1 text-[#FF4081]/80">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                <User size={14} />
                Tên của bạn <span className="text-[#FF4081]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] text-xs transition-all duration-200"
                placeholder="Nhập tên của bạn"
                disabled={!isAuthenticated}
              />
            </div>

            {/* Email field - hidden for guests, shown for admins */}
            {!isGuestAuthenticated && (
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  <Mail size={14} />
                  Email <span className="text-[#FF4081]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] text-xs transition-all duration-200"
                  placeholder="your.email@example.com"
                  disabled={!isAuthenticated}
                />
              </div>
            )}

            {/* Guest email info */}
            {isGuestAuthenticated && (
              <div className="bg-[#2A2A2A] border-2 border-[#00E5FF]/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-[#B0BEC5]">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  <Mail size={14} />
                  <span>Email: <span className="text-[#00E5FF]">{guest?.email}</span></span>
                </div>
                <p className="text-xs text-[#B0BEC5]/80 mt-1">Email sẽ được tự động lấy từ tài khoản Google của bạn</p>
              </div>
            )}

            <div>
              <label htmlFor="content" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                <MessageSquare size={14} />
                Nội dung tin nhắn <span className="text-[#FF4081]">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                maxLength={255}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] text-xs transition-all duration-200"
                placeholder={isAuthenticated ? "Viết tin nhắn của bạn ở đây... (tối đa 255 ký tự)" : "Bạn cần đăng nhập để gửi tin nhắn"}
                disabled={!isAuthenticated}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[#B0BEC5]">
                  Tin nhắn sẽ được hiển thị trên trang chủ
                </span>
                <span className={`text-xs ${formData.content.length >= 255 ? 'text-[#FF4081]' : 'text-[#B0BEC5]'}`}>
                  {formData.content.length}/255 ký tự
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={!isAuthenticated || isSubmitting || formData.content.length > 255 || !canSendMessage}
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:gap-3"
              >
                {!isAuthenticated ? (
                  <>
                    <LogIn size={16} />
                    Cần Đăng Nhập
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="relative w-4 h-4 md:w-5 md:h-5">
                      <Image
                        src="/reading.gif"
                        alt="Sending..."
                        width={16}
                        height={16}
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                    Đang gửi...
                  </>
                ) : formData.content.length > 255 ? (
                  <>
                    <AlertCircle size={16} />
                    Vượt quá 255 ký tự
                  </>
                ) : !canSendMessage ? (
                  <>
                    <XCircle size={16} />
                    Đã đạt giới hạn hôm nay
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Gửi tin nhắn
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-[#FF4081]/30">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
              <Info size={18} className="text-[#00E5FF]" />
              <h3 className="text-base sm:text-lg font-medium text-[#FFFFFF]">Thông tin liên hệ khác</h3>
            </div>
            <div className="text-[#B0BEC5] space-y-2">
              <p className="text-xs">• Bạn cũng có thể góp ý trực tiếp trong phần bình luận của từng chương</p>
              <p className="text-xs">• Tôi sẽ cố gắng phản hồi tất cả tin nhắn trong thời gian sớm nhất</p>
              <p className="text-xs">• Cảm ơn bạn đã dành thời gian đọc truyện của tôi!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
