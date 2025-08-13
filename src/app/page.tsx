'use client';

import { useState, useEffect } from 'react';
import Navigation from "../component/Navigation";
import Link from "next/link";
import { BookOpen, MessageSquare, Heart, Star, Sparkles, Quote } from 'lucide-react';
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

  useEffect(() => {
    loadMessages();
  }, []);

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

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
            <p className="text-lg text-gray-300">
              Những lời động viên và góp ý quý báu từ các bạn
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-300">Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {messages.map((message, index) => {
                const IconComponent = noteIcons[index % noteIcons.length];
                const colorClass = noteColors[index % noteColors.length];
                const rotation = getRandomRotation();
                const delay = getRandomDelay(index);

                return (
                  <div
                    key={message._id}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      animationDelay: `${delay}s`
                    }}
                  >
                    <div className={`bg-gradient-to-br ${colorClass} p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 relative`}>
                      {/* Note pin effect */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
                      
                      {/* Message content */}
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          <IconComponent size={24} className="text-white/80" />
                        </div>
                        <h3 className="font-semibold text-white mb-3 text-lg">
                          {message.name}
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed line-clamp-4">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Date */}
                      <div className="absolute bottom-2 right-2 text-white/60 text-xs">
                        {new Date(message.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                          Xem chi tiết
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
}
