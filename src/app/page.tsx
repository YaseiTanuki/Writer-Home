'use client';

import { useState, useEffect } from 'react';
import Navigation from "../component/Navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, MessageSquare, Heart, Star, Sparkles, Quote, X } from 'lucide-react';
import { storyService } from "../services/storyService";

interface Message {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      // Shuffle messages randomly
      const shuffledMessages = [...messages].sort(() => Math.random() - 0.5);
      
      // Determine device type and set appropriate message limits
      const isMobile = window.innerWidth < 768; // md breakpoint
      const maxMessages = isMobile ? 9 : 20; // Mobile: 3x3=9, Desktop: 4x5=20
      
      setDisplayedMessages(shuffledMessages.slice(0, maxMessages));
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await storyService.getMessages();
      setMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomRotation = () => {
    return Math.random() * 6 - 3; // -3 to 3 degrees
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
  };

  // Create grid layout
  const renderGrid = () => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile: 3x3 layout
      return (
        <div className="grid grid-cols-3 gap-4">
          {displayedMessages.map((message, index) => renderMessage(message, index))}
        </div>
      );
    } else {
      // Desktop: 4x5 layout
      return (
        <div className="grid grid-cols-5 gap-6">
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
        className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
        style={{
          transform: `rotate(${rotation}deg)`,
          animationDelay: `${delay}s`
        }}
        onClick={() => handleMessageClick(message)}
      >
        <div className={`bg-gradient-to-br ${colorClass} p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 relative min-h-[120px] sm:min-h-[140px]`}>
          {/* Note pin effect */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-md"></div>
          
          {/* Sender name - small and in corner */}
          <div className="absolute top-2 left-2 text-white/80 text-xs font-medium bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
            {message.name}
          </div>
          
          {/* Message content - main focus */}
          <div className="text-center pt-8 sm:pt-10">
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed line-clamp-4 sm:line-clamp-5">
              {truncatedContent}
            </p>
          </div>
          
          {/* Date */}
          <div className="absolute bottom-2 right-2 text-white/60 text-xs">
            {new Date(message.createdAt).toLocaleDateString('vi-VN')}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <div className="bg-white/90 text-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
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
      <main className="pt-16 md:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Chào mừng đến với Góc Truyện của Tôi
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 px-4 sm:px-0">
            Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học của tôi
          </p>
          <div className="flex justify-center">
            <Link 
              href="/stories" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg sm:text-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
            >
              <BookOpen size={24} />
              Đọc Truyện của Tôi
            </Link>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <MessageSquare size={32} className="text-blue-400" />
              Tin Nhắn từ Độc Giả
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              Những lời động viên và góp ý quý báu từ các bạn
            </p>
            <div className="text-sm text-gray-400">
              <span className="hidden md:inline">Layout: 4 hàng × 5 tin (ngẫu nhiên)</span>
              <span className="md:hidden">Layout: 3 hàng × 3 tin (ngẫu nhiên)</span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
                <Image
                  src="/reading.gif"
                  alt="Loading messages..."
                  width={80}
                  height={80}
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
              <p className="mt-4 text-gray-300">Đang tải tin nhắn...</p>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
                <MessageSquare size={48} className="text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Chưa có tin nhắn nào từ độc giả</p>
                <p className="text-gray-500 mt-2">Hãy là người đầu tiên để lại tin nhắn!</p>
                <Link
                  href="/contact"
                  className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
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
                <div className="text-center mt-8">
                  <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                    <p className="text-gray-300 mb-3">
                      Còn {messages.length - displayedMessages.length} tin nhắn khác
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <MessageSquare size={16} />
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
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-gray-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Bạn có muốn để lại tin nhắn không?
            </h3>
            <p className="text-gray-300 mb-6">
              Chia sẻ cảm nhận, góp ý hoặc đơn giản là lời động viên cho tôi
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <MessageSquare size={20} />
              Gửi Tin Nhắn Ngay
            </Link>
          </div>
        </div>
      </main>

      {/* Message Popup/Dialog */}
      {showPopup && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare size={20} />
                  Tin Nhắn từ {selectedMessage.name}
                </h3>
                <button
                  onClick={closePopup}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {selectedMessage.content}
                </p>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                <span>Ngày gửi: {new Date(selectedMessage.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>{selectedMessage.content.length}/255 ký tự</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="bg-gray-50 px-6 py-4 flex justify-center">
              <button
                onClick={closePopup}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-8 rounded-md font-medium transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
