'use client';

import { useState, useEffect } from 'react';
import Navigation from "../component/Navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, MessageSquare, Heart, Star, Sparkles, Quote, X } from 'lucide-react';
import { storyService } from "../services/storyService";
import { useAuth } from "../contexts/AuthContext";
import { useGuest } from "../contexts/GuestContext";

interface Message {
  _id: string;
  name: string;
  content: string;
  reply?: string;
  createdAt: string;
  guestReplies?: Array<{
    _id: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPicture?: string;
    content: string;
    createdAt: string;
  }>;
}

export default function Home() {
  const { user, isAuthenticated: isAdminAuthenticated } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated } = useGuest();
  
  // Combined authentication state
  const isAuthenticated = isAdminAuthenticated || isGuestAuthenticated;
  const currentUser = user || guest;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Hourly message rotation state
  const [lastRotationTime, setLastRotationTime] = useState<number>(0);
  const [currentHourlyMessages, setCurrentHourlyMessages] = useState<Message[]>([]);

  // Debug authentication state
  useEffect(() => {
    console.log('Auth state changed:', { 
      user, 
      isAdminAuthenticated, 
      guest, 
      isGuestAuthenticated,
      isAuthenticated,
      currentUser
    });
    
    // Debug localStorage
    if (typeof window !== 'undefined') {
      const authTokens = localStorage.getItem('auth_tokens');
      const guestToken = localStorage.getItem('guestToken');
      const guestInfo = localStorage.getItem('guestInfo');
      
      console.log('LocalStorage auth_tokens:', authTokens);
      console.log('LocalStorage guestToken:', guestToken);
      console.log('LocalStorage guestInfo:', guestInfo);
      
      if (authTokens) {
        try {
          const parsed = JSON.parse(authTokens);
          console.log('Parsed auth tokens:', parsed);
        } catch (e) {
          console.error('Error parsing auth tokens:', e);
        }
      }
      
      if (guestInfo) {
        try {
          const parsed = JSON.parse(guestInfo);
          console.log('Parsed guest info:', parsed);
        } catch (e) {
          console.error('Error parsing guest info:', e);
        }
      }
    }
  }, [user, isAdminAuthenticated, guest, isGuestAuthenticated, isAuthenticated, currentUser]);

  useEffect(() => {
    // Restore hourly message rotation state from localStorage
    const restoreHourlyState = () => {
      try {
        const storedRotationTime = localStorage.getItem('lastRotationTime');
        const storedHourlyMessages = localStorage.getItem('currentHourlyMessages');
        
        if (storedRotationTime && storedHourlyMessages) {
          const rotationTime = parseInt(storedRotationTime);
          const hourlyMessages = JSON.parse(storedHourlyMessages);
          
          setLastRotationTime(rotationTime);
          setCurrentHourlyMessages(hourlyMessages);
          
          console.log('Restored hourly state from localStorage:', {
            rotationTime: new Date(rotationTime),
            messageCount: hourlyMessages.length
          });
        }
      } catch (error) {
        console.error('Error restoring hourly state from localStorage:', error);
      }
    };
    
    restoreHourlyState();
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Check if we need to rotate messages (every hour)
      if (now - lastRotationTime >= oneHour || currentHourlyMessages.length === 0) {
        // Shuffle messages randomly for this hour
        const shuffledMessages = [...messages].sort(() => Math.random() - 0.5);
        
        // Determine device type and set appropriate message limits
        const isMobile = window.innerWidth < 768; // md breakpoint
        const maxMessages = isMobile ? 6 : 20; // Mobile: 3x2=6, Desktop: 4x5=20
        
        const newHourlyMessages = shuffledMessages.slice(0, maxMessages);
        setCurrentHourlyMessages(newHourlyMessages);
        setDisplayedMessages(newHourlyMessages);
        setLastRotationTime(now);
        
        // Store in localStorage for persistence across page refreshes
        localStorage.setItem('lastRotationTime', now.toString());
        localStorage.setItem('currentHourlyMessages', JSON.stringify(newHourlyMessages));
        
        console.log('Messages rotated for new hour:', newHourlyMessages.length, 'messages');
      } else {
        // Use existing hourly messages
        setDisplayedMessages(currentHourlyMessages);
        console.log('Using existing hourly messages:', currentHourlyMessages.length, 'messages');
      }
    }
  }, [messages, lastRotationTime, currentHourlyMessages]);
  
  // Auto-rotate messages every hour
  useEffect(() => {
    const checkHourlyRotation = () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (now - lastRotationTime >= oneHour && messages.length > 0) {
        // Force rotation by updating lastRotationTime
        setLastRotationTime(now);
        console.log('Auto-rotating messages for new hour');
      }
    };
    
    // Check every minute
    const interval = setInterval(checkHourlyRotation, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastRotationTime, messages.length]);

  // Debug selectedMessage changes
  useEffect(() => {
    if (selectedMessage) {
      console.log('SelectedMessage changed:', selectedMessage);
      console.log('SelectedMessage guestReplies:', selectedMessage.guestReplies);
    }
  }, [selectedMessage]);

  // Auto-update selectedMessage when messages change (e.g., after adding guest reply)
  useEffect(() => {
    if (selectedMessage && messages.length > 0) {
      const updatedMessage = messages.find(msg => msg._id === selectedMessage._id);
      if (updatedMessage && JSON.stringify(updatedMessage) !== JSON.stringify(selectedMessage)) {
        console.log('Auto-updating selectedMessage with fresh data:', updatedMessage);
        setSelectedMessage(updatedMessage);
      }
    }
  }, [messages, selectedMessage]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await storyService.getMessages();
      console.log('Loaded messages:', response.messages);
      console.log('Messages with guestReplies:', response.messages.filter(msg => msg.guestReplies && msg.guestReplies.length > 0));
      setMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomRotation = () => {
    return Math.random() * 4 - 2; // -2 to 2 degrees (giảm rotation)
  };

  const getRandomDelay = (index: number) => {
    return index * 0.1; // Staggered animation
  };

  const noteColors = [
    'from-yellow-400 to-orange-400',
    'from-pink-400 to-rose-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-purple-400 to-violet-400',
    'from-indigo-400 to-blue-400',
    'from-red-400 to-pink-400',
    'from-teal-400 to-green-400'
  ];

  const noteIcons = [Heart, Star, Sparkles, Quote, MessageSquare];

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Check if user is authenticated
    if (!isAuthenticated || !currentUser) {
      setNotification({
        type: 'error',
        message: 'Vui lòng đăng nhập để có thể trả lời tin nhắn!'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    
    try {
      setIsSendingReply(true);
      
      // Create guest reply data with current user information
      const guestReplyData = {
        messageId: selectedMessage._id,
        content: replyText,
        guestId: currentUser.id,
        guestName: 'username' in currentUser ? currentUser.username : currentUser.displayName,
        guestEmail: 'email' in currentUser ? currentUser.email : 'guest@example.com',
        guestPicture: 'picture' in currentUser ? currentUser.picture : undefined
      };
      
      // Call API to add guest reply
      const response = await storyService.addGuestReply(guestReplyData);
      console.log('Guest reply added successfully:', response);
      
      // Reload messages from database to get the updated data
      await loadMessages();
      
      // Clear reply text
      setReplyText('');
      
      // Show success message
      setNotification({
        type: 'success',
        message: 'Đã thêm câu trả lời thành công!'
      });
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Failed to add guest reply:', error);
      setNotification({
        type: 'error',
        message: 'Có lỗi xảy ra khi thêm câu trả lời!'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Create grid layout
  const renderGrid = () => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile: 3x2 layout với gap lớn hơn
      return (
        <div className="grid grid-cols-2 gap-6">
          {displayedMessages.map((message, index) => renderMessage(message, index))}
        </div>
      );
    } else {
      // Desktop: 4x4 layout với gap lớn hơn
      return (
        <div className="grid grid-cols-4 gap-8">
          {displayedMessages.map((message, index) => renderMessage(message, index))}
        </div>
      );
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const IconComponent = noteIcons[index % noteIcons.length];
    const colorClass = noteColors[index % noteIcons.length];
    const rotation = getRandomRotation();
    const delay = getRandomDelay(index);

    // Truncate content to 255 characters
    const truncatedContent = message.content.length > 255 
      ? message.content.substring(0, 255) + '...'
      : message.content;

      return (
    <div
      key={message._id}
      className="group cursor-pointer transform hover:scale-105 transition-all duration-300 flex-shrink-0"
      style={{
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delay}s`
      }}
      onClick={() => handleMessageClick(message)}
    >
        <div className={`bg-gradient-to-br ${colorClass} p-3 sm:p-4 rounded-md shadow-md hover:shadow-lg transition-all duration-300 relative h-[160px] sm:h-[140px] flex flex-col border border-white/10 overflow-hidden`}>
          {/* Note pin effect */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full shadow-md border border-white/20"></div>
          
          {/* Sender name - small and in corner */}
          <div className="absolute top-2 left-2 text-white/90 text-xs sm:text-xs font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 max-w-[100px] truncate">
            {message.name}
          </div>
          
          {/* Message content - main focus with flex-grow to push date to bottom */}
          <div className="text-center pt-6 sm:pt-6 flex-grow flex items-center justify-center px-2">
            <p className="text-white/95 text-xs sm:text-sm leading-relaxed line-clamp-4 sm:line-clamp-4 break-words">
              {truncatedContent}
            </p>
          </div>
          
          {/* Date - now positioned at bottom without absolute positioning */}
          <div className="text-white/70 text-xs sm:text-xs text-center mt-2 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
            {new Date(message.createdAt).toLocaleDateString('vi-VN')}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
            <div className="bg-white/95 text-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Xem chi tiết
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="pt-16 md:pt-24 max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-8 px-3 sm:px-0">
          <div className="relative mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 leading-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Chào mừng đến với Góc Truyện của Tôi
            </h1>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 mb-6 px-3 sm:px-0">
            Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học của tôi
          </p>
          <div className="flex justify-center px-3 sm:px-0">
            <Link 
              href="/stories" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102 flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              Đọc Truyện của Tôi
            </Link>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mb-8 px-3 sm:px-0">
          <div className="text-center mb-6">
            <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center justify-center gap-2">
                <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
                <MessageSquare size={20} className="text-blue-400" />
                Tin Nhắn từ Độc Giả
              </h2>
              <p className="text-xs text-gray-300 mb-3">
                Những lời động viên và góp ý quý báu từ các bạn
              </p>
              <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                <span className="hidden md:inline">Layout: 5 hàng × 4 tin (ngẫu nhiên)</span>
                <span className="md:hidden">Layout: 3 hàng × 2 tin (ngẫu nhiên)</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
                <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-3">
                  <Image
                    src="/reading.gif"
                    alt="Loading messages..."
                    width={64}
                    height={64}
                    className="rounded-md w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-300 text-xs">Đang tải tin nhắn...</p>
              </div>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
                <MessageSquare size={32} className="text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-xs">Chưa có tin nhắn nào từ độc giả</p>
                <p className="text-gray-500 mt-2 text-xs">Hãy là người đầu tiên để lại tin nhắn!</p>
                <Link
                  href="/contact"
                  className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 text-xs"
                >
                  Gửi Tin Nhắn
                </Link>
              </div>
            </div>
          ) : (
            <>
              {renderGrid()}
              
              {/* Show more messages info if there are more */}
              {messages.length > displayedMessages.length && (
                <div className="text-center mt-6">
                  <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-gray-300 text-xs">
                        Còn {messages.length - displayedMessages.length} tin nhắn khác
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors duration-200"
                    >
                      <MessageSquare size={14} />
                      Gửi Tin Nhắn Mới
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-md p-4 sm:p-6 border border-blue-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Bạn có muốn để lại tin nhắn không?
              </h3>
            </div>
            <p className="text-gray-300 mb-4 text-xs">
              Chia sẻ cảm nhận, góp ý hoặc đơn giản là lời động viên cho tôi
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-102 text-xs"
            >
              <MessageSquare size={16} />
              Gửi Tin Nhắn Ngay
            </Link>
          </div>
        </div>
      </main>

      {/* Message Popup/Dialog */}
      {showPopup && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-gray-900 rounded-md shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <MessageSquare size={16} />
                  Tin Nhắn từ {selectedMessage.name}
                </h3>
                <button
                  onClick={closePopup}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <div className="bg-gray-800/50 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-200 leading-relaxed text-xs">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
              
              {/* Admin Reply */}
              {selectedMessage.reply && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-xs font-medium text-green-300">Trả lời của Admin</span>
                  </div>
                  <p className="text-green-200 leading-relaxed text-xs">
                    {selectedMessage.reply}
                  </p>
                </div>
              )}
              
              {/* Guest Replies Section */}
              {selectedMessage.guestReplies && selectedMessage.guestReplies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Câu trả lời của guests ({selectedMessage.guestReplies.length}):
                  </h4>
                  <div className="space-y-2">
                    {selectedMessage.guestReplies.map((reply, index) => (
                      <div key={reply._id || index} className="p-2 bg-blue-900/20 border border-blue-700/50 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-300">{reply.guestName}</span>
                          <span className="text-xs text-blue-400">({reply.guestEmail})</span>
                          <span className="text-xs text-blue-500">
                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-blue-200">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Guest Information Form */}
              {/* This section is removed as per the edit hint */}
              
              {/* Reply Input Section */}
              {!isAuthenticated ? (
                <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-300">Đăng nhập để trả lời</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Bạn cần đăng nhập để có thể trả lời tin nhắn này</p>
                  <Link
                    href="/auth"
                    className="inline-block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs font-medium text-yellow-300">Thêm câu trả lời của bạn</span>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung trả lời..."
                      className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/50 rounded-md text-gray-200 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSendingReply}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors duration-200"
                      >
                        {isSendingReply ? 'Đang thêm...' : 'Thêm câu trả lời'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-3">
                <span>Ngày gửi: {new Date(selectedMessage.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>{selectedMessage.content.length}/255 ký tự</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="bg-gray-800 px-4 py-3 flex justify-center">
              <button
                onClick={closePopup}
                className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 px-6 rounded-md font-medium transition-colors duration-200 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-3 right-3 z-50 max-w-sm mx-auto">
          <div className={`rounded-md shadow-lg p-3 border backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-green-900/30 border-green-700/50 text-green-300' 
              : 'bg-red-900/30 border-red-700/50 text-red-300'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium">{notification.message}</p>
              </div>
              <div className="ml-3 flex-shrink-0">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1 ${
                    notification.type === 'success' 
                      ? 'text-green-300 hover:bg-green-900/20' 
                      : 'text-red-300 hover:bg-red-900/20'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-600`}
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
