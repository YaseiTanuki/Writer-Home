'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#a6adc8' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  // CTP inline palette
  const bg      = '#1e1e2e';
  const card    = '#313244';
  const border  = '#45475a';
  const textMain = '#cdd6f4';
  const textSub  = '#a6adc8';
  const muted    = '#6c7086';
  const mauve    = '#cba6f7';
  const blue     = '#89b4fa';
  const green    = '#a6e3a1';
  const red      = '#f38ba8';
  const yellow   = '#f9e2af';
  const surface  = '#181825';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ color: mauve, backgroundColor: 'rgba(203,166,247,0.10)', border: `1px solid rgba(203,166,247,0.25)` }}
          >
            <Mail size={12} />
            Liên hệ
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: textMain }}>Liên hệ với tôi</h1>
          <p className="text-sm" style={{ color: muted }}>
            Bạn có góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện? Hãy để lại tin nhắn!
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl p-5 sm:p-8" style={{ backgroundColor: card, border: `1px solid ${border}` }}>

          {/* Auth required notice */}
          {!isAuthenticated && (
            <div
              className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'rgba(249,226,175,0.08)', border: `1px solid rgba(249,226,175,0.2)` }}
            >
              <AlertCircle size={16} style={{ color: yellow, flexShrink: 0, marginTop: '2px' }} />
              <div className="flex-1">
                <p className="text-xs font-medium mb-0.5" style={{ color: yellow }}>Bạn cần đăng nhập để gửi tin nhắn</p>
                <p className="text-xs" style={{ color: textSub }}>Tin nhắn sẽ được liên kết với tài khoản của bạn</p>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
              >
                <LogIn size={13} />
                Đăng Nhập
              </button>
            </div>
          )}

          {/* Daily limit notice */}
          {isGuestAuthenticated && (
            <div
              className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'rgba(137,180,250,0.08)', border: `1px solid rgba(137,180,250,0.2)` }}
            >
              <Clock size={15} style={{ color: blue, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: blue }}>Giới hạn tin nhắn hàng ngày</p>
                <p className="text-xs" style={{ color: textSub }}>Mỗi tài khoản Google chỉ được gửi tối đa 5 tin nhắn mỗi ngày</p>
              </div>
            </div>
          )}

          {/* Message limit status */}
          {isAuthenticated && messageLimitInfo && (
            <div
              className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: canSendMessage ? 'rgba(166,227,161,0.08)' : 'rgba(243,139,168,0.08)',
                border: `1px solid ${canSendMessage ? 'rgba(166,227,161,0.2)' : 'rgba(243,139,168,0.2)'}`,
              }}
            >
              {canSendMessage
                ? <CheckCircle size={15} style={{ color: green, flexShrink: 0, marginTop: '2px' }} />
                : <XCircle size={15} style={{ color: red, flexShrink: 0, marginTop: '2px' }} />}
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: canSendMessage ? green : red }}>
                  {canSendMessage ? 'Bạn có thể gửi tin nhắn' : 'Bạn đã đạt giới hạn hôm nay'}
                </p>
                <p className="text-xs" style={{ color: textSub }}>
                  {canSendMessage
                    ? `Đã gửi ${messageLimitInfo.todayMessageCount}/5 hôm nay · Còn lại ${remainingMessages} tin nhắn`
                    : `Đã gửi ${messageLimitInfo.todayMessageCount}/5. Vui lòng thử lại ngày mai.`}
                </p>
              </div>
            </div>
          )}

          {/* Checking limit */}
          {isCheckingLimit && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(137,180,250,0.06)', border: `1px solid rgba(137,180,250,0.15)` }}>
              <div className="w-3.5 h-3.5 border border-current rounded-full animate-spin flex-shrink-0" style={{ color: blue, borderTopColor: 'transparent' }} />
              <p className="text-xs" style={{ color: textSub }}>Đang kiểm tra giới hạn tin nhắn...</p>
            </div>
          )}

          {/* Success */}
          {submitStatus === 'success' && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(166,227,161,0.08)', border: '1px solid rgba(166,227,161,0.2)' }}>
              <CheckCircle size={15} style={{ color: green, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: green }}>Tin nhắn đã được gửi thành công!</p>
                <p className="text-xs" style={{ color: textSub }}>Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể.</p>
              </div>
            </div>
          )}

          {/* Error */}
          {submitStatus === 'error' && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(243,139,168,0.08)', border: '1px solid rgba(243,139,168,0.2)' }}>
              <AlertCircle size={15} style={{ color: red, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: red }}>Không thể gửi tin nhắn</p>
                <p className="text-xs" style={{ color: textSub }}>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: textSub }}>
                <User size={13} />
                Tên của bạn <span style={{ color: mauve }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isAuthenticated}
                placeholder="Nhập tên của bạn"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: surface, color: textMain, border: `1px solid ${border}`, caretColor: mauve }}
              />
            </div>

            {/* Email (non-guest only) */}
            {!isGuestAuthenticated && (
              <div>
                <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: textSub }}>
                  <Mail size={13} />
                  Email <span style={{ color: mauve }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isAuthenticated}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-200 disabled:opacity-50"
                  style={{ backgroundColor: surface, color: textMain, border: `1px solid ${border}`, caretColor: mauve }}
                />
              </div>
            )}

            {/* Guest email info */}
            {isGuestAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
                <Mail size={13} style={{ color: blue }} />
                <span style={{ color: textSub }}>Email:&nbsp;</span>
                <span style={{ color: blue }}>{guest?.email}</span>
              </div>
            )}

            {/* Message content */}
            <div>
              <label htmlFor="content" className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: textSub }}>
                <MessageSquare size={13} />
                Nội dung tin nhắn <span style={{ color: mauve }}>*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={5}
                maxLength={255}
                value={formData.content}
                onChange={handleInputChange}
                disabled={!isAuthenticated}
                placeholder={isAuthenticated ? 'Viết tin nhắn của bạn... (tối đa 255 ký tự)' : 'Bạn cần đăng nhập để gửi tin nhắn'}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-200 resize-none disabled:opacity-50"
                style={{ backgroundColor: surface, color: textMain, border: `1px solid ${border}`, caretColor: mauve }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: muted }}>Tin nhắn sẽ xuất hiện trên trang chủ</span>
                <span className="text-xs" style={{ color: formData.content.length >= 255 ? red : muted }}>
                  {formData.content.length}/255
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isAuthenticated || isSubmitting || formData.content.length > 255 || !canSendMessage}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ backgroundColor: mauve, color: '#11111b' }}
            >
              {!isAuthenticated ? (<><LogIn size={15} />Cần Đăng Nhập</>) :
               isSubmitting ? (<><div className="w-3.5 h-3.5 border border-[#11111b] rounded-full animate-spin" style={{ borderTopColor: 'transparent' }} />Đang gửi...</>) :
               formData.content.length > 255 ? (<><AlertCircle size={15} />Vượt quá 255 ký tự</>) :
               !canSendMessage ? (<><XCircle size={15} />Đã đạt giới hạn hôm nay</>) :
               (<><Send size={15} />Gửi tin nhắn</>)}
            </button>
          </form>

          {/* Extra info */}
          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} style={{ color: blue }} />
              <h3 className="text-sm font-semibold" style={{ color: textMain }}>Thông tin thêm</h3>
            </div>
            <ul className="space-y-1.5">
              {['Bạn cũng có thể góp ý trong phần bình luận của từng chương', 'Tôi sẽ cố gắng phản hồi tất cả tin nhắn trong thời gian sớm nhất', 'Cảm ơn bạn đã dành thời gian đọc truyện của tôi!'].map(txt => (
                <li key={txt} className="flex items-start gap-2 text-xs" style={{ color: textSub }}>
                  <span style={{ color: mauve, flexShrink: 0 }}>·</span>{txt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
