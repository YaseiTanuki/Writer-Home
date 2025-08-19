'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen, FileText, CheckCircle, Edit3, Trash2, AlertTriangle, Tag, Plus, Settings, Mail, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storyService } from '../../services/storyService';
import { Story, Chapter, Category } from '../../types/story';
import Navigation from '../../component/Navigation';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const [storiesResponse, chaptersResponse, categoriesResponse, messagesResponse, usersResponse] = await Promise.all([
        storyService.getStories(),
        storyService.getAllChapters(),
        storyService.getCategories(),
        storyService.getMessages(),
        storyService.getUsers()
      ]);
      
      setStories(storiesResponse.stories);
      setChapters(chaptersResponse.chapters);
      setCategories(categoriesResponse.categories);
      setMessagesCount(messagesResponse.count);
      setUsersCount(usersResponse.count);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={64}
                height={64}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-[#B0BEC5] text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6 px-3 sm:px-4">
          <div className="text-center">
            <div className="relative mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mb-2 leading-tight flex items-center justify-center gap-2">
                <div className="w-1.5 h-3 bg-[#D2691E] rounded-full"></div>
                <Settings size={24} className="text-[#D2691E] w-6 h-6" />
                Bảng Điều Khiển Quản Trị
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#D2691E] rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs sm:text-sm text-[#B0BEC5]">
              Quản lý toàn bộ hệ thống truyện và người dùng
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-3 sm:px-4">
          <div className="bg-[#1E1E1E] rounded-2xl p-3 text-center border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-[#00E5FF]/20 rounded-md shadow-md">
              <BookOpen size={20} className="text-[#00E5FF]" />
            </div>
            <p className="text-xl font-bold text-[#FFFFFF] mb-1">{stories.length}</p>
            <p className="text-xs text-[#00E5FF]">Truyện</p>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-3 text-center border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-[#00E5FF]/20 rounded-md shadow-md">
              <FileText size={20} className="text-[#00E5FF]" />
            </div>
            <p className="text-xl font-bold text-[#FFFFFF] mb-1">{chapters.length}</p>
            <p className="text-xs text-[#00E5FF]">Chương</p>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-3 text-center border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-[#00E5FF]/20 rounded-md shadow-md">
              <Tag size={20} className="text-[#00E5FF]" />
            </div>
            <p className="text-xl font-bold text-[#FFFFFF] mb-1">{categories.length}</p>
            <p className="text-xs text-[#00E5FF]">Thể Loại</p>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-3 text-center border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-[#00E5FF]/20 rounded-md shadow-md">
              <CheckCircle size={20} className="text-[#00E5FF]" />
            </div>
            <p className="text-xl font-bold text-[#FFFFFF] mb-1">
              {stories.filter(s => s.status === 'public').length}
            </p>
            <p className="text-xs text-[#00E5FF]">Đã Xuất Bản</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3 sm:px-4">
          {/* Stories Management */}
          <Link 
            href="/admin/stories"
            className="group bg-[#1E1E1E] rounded-2xl p-6 border-2 border-[#D2691E] hover:border-[#C97C4B] transition-all duration-300 hover:shadow-[0_0_8px_#D2691E]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#00E5FF]/20 rounded-md group-hover:bg-[#00E5FF]/30 transition-colors duration-300">
                <BookOpen size={20} className="text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#00E5FF]">{stories.length}</div>
                <div className="text-xs text-[#B0BEC5]">truyện</div>
              </div>
            </div>
            <h3 className="text-base font-semibold text-[#FFFFFF] mb-2">Quản Lý Truyện</h3>
            <p className="text-xs text-[#B0BEC5] mb-3">Xem, thêm, sửa và xóa truyện</p>
            <div className="flex items-center text-[#00E5FF] text-xs group-hover:text-[#00E5FF]/80 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Chapters Management */}
          <Link 
            href="/admin/chapters"
            className="group bg-[#1E1E1E] rounded-2xl p-6 border-2 border-[#D2691E] hover:border-[#C97C4B] transition-all duration-300 hover:shadow-[0_0_8px_#D2691E]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#00E5FF]/20 rounded-lg group-hover:bg-[#00E5FF]/30 transition-colors duration-300">
                <FileText size={24} className="text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5FF]">{chapters.length}</div>
                <div className="text-xs text-[#B0BEC5]">chương</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Quản Lý Chương</h3>
            <p className="text-sm text-[#B0BEC5] mb-4">Xem, thêm, sửa và xóa chương</p>
            <div className="flex items-center text-[#00E5FF] text-sm group-hover:text-[#00E5FF]/80 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Categories Management */}
          <Link 
            href="/admin/categories"
            className="group bg-[#1E1E1E] rounded-2xl p-6 border-2 border-[#D2691E] hover:border-[#C97C4B] transition-all duration-300 hover:shadow-[0_0_8px_#D2691E]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#00E5FF]/20 rounded-lg group-hover:bg-[#00E5FF]/30 transition-colors duration-300">
                <Tag size={24} className="text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5FF]">{categories.length}</div>
                <div className="text-xs text-[#B0BEC5]">thể loại</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Quản Lý Thể Loại</h3>
            <p className="text-sm text-[#B0BEC5] mb-4">Xem, thêm và xóa thể loại truyện</p>
            <div className="flex items-center text-[#00E5FF] text-sm group-hover:text-[#00E5FF]/80 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Messages Management */}
          <Link 
            href="/admin/messages"
            className="group bg-[#1E1E1E] rounded-2xl p-6 border-2 border-[#D2691E] hover:border-[#C97C4B] transition-all duration-300 hover:shadow-[0_0_8px_#D2691E]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#00E5FF]/20 rounded-lg group-hover:bg-[#00E5FF]/30 transition-colors duration-300">
                <Mail size={24} className="text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5FF]">{messagesCount}</div>
                <div className="text-xs text-[#B0BEC5]">tin nhắn</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Quản Lý Tin Nhắn</h3>
            <p className="text-sm text-[#B0BEC5] mb-4">Xem và quản lý tin nhắn từ người dùng</p>
            <div className="flex items-center text-[#00E5FF] text-sm group-hover:text-[#00E5FF]/80 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Users Management */}
          <Link 
            href="/admin/users"
            className="group bg-[#1E1E1E] rounded-2xl p-6 border-2 border-[#D2691E] hover:border-[#C97C4B] transition-all duration-300 hover:shadow-[0_0_8px_#D2691E]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#00E5FF]/20 rounded-lg group-hover:bg-[#00E5FF]/30 transition-colors duration-300">
                <Users size={24} className="text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5FF]">{usersCount}</div>
                <div className="text-xs text-[#B0BEC5]">người dùng</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Quản Lý Người Dùng</h3>
            <p className="text-sm text-[#B0BEC5] mb-4">Xem và quản lý tài khoản người dùng</p>
            <div className="flex items-center text-[#00E5FF] text-sm group-hover:text-[#00E5FF]/80 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4">
          <div className="bg-[#1E1E1E] rounded-2xl shadow-lg border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
            <div className="px-6 py-4 border-b-2 border-[#D2691E]/30">
              <h2 className="text-lg font-medium text-[#FFFFFF]">Thao Tác Nhanh</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/admin/new-story"
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  Tạo Truyện Mới
                </Link>
                <Link 
                  href="/admin/new-chapter"
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  Tạo Chương Mới
                </Link>
                <Link
                  href="/stories"
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <BookOpen size={18} />
                  Xem Trang Công Khai
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
