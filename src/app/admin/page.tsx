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
      <div className="min-h-screen bg-black">
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
            <p className="mt-4 text-gray-300 text-xs">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6 px-3 sm:px-4">
          <div className="text-center">
            <div className="relative mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight flex items-center justify-center gap-2">
                <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
                <Settings size={24} className="text-blue-400 w-6 h-6" />
                Bảng Điều Khiển Quản Trị
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Quản lý toàn bộ hệ thống truyện và người dùng
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-3 sm:px-4">
          <div className="bg-blue-900/30 rounded-md p-3 text-center border border-blue-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md shadow-md">
              <BookOpen size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white mb-1">{stories.length}</p>
            <p className="text-xs text-blue-200">Truyện</p>
          </div>
          <div className="bg-green-900/30 rounded-md p-3 text-center border border-green-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-600 to-green-700 rounded-md shadow-md">
              <FileText size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white mb-1">{chapters.length}</p>
            <p className="text-xs text-green-200">Chương</p>
          </div>
          <div className="bg-purple-900/30 rounded-md p-3 text-center border border-purple-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-auto mb-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-md shadow-md">
              <Tag size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white mb-1">{categories.length}</p>
            <p className="text-xs text-purple-200">Thể Loại</p>
          </div>
          <div className="bg-yellow-900/30 rounded-md p-3 text-center border border-yellow-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-md shadow-md">
              <CheckCircle size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white mb-1">
              {stories.filter(s => s.status === 'public').length}
            </p>
            <p className="text-xs text-yellow-200">Đã Xuất Bản</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3 sm:px-4">
          {/* Stories Management */}
          <Link 
            href="/admin/stories"
            className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-900/30 rounded-md group-hover:bg-blue-900/40 transition-colors duration-300">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">{stories.length}</div>
                <div className="text-xs text-gray-400">truyện</div>
              </div>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Quản Lý Truyện</h3>
            <p className="text-xs text-gray-300 mb-3">Xem, thêm, sửa và xóa truyện</p>
            <div className="flex items-center text-blue-400 text-xs group-hover:text-blue-300 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Chapters Management */}
          <Link 
            href="/admin/chapters"
            className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-900/20 rounded-lg group-hover:bg-green-900/30 transition-colors duration-300">
                <FileText size={24} className="text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{chapters.length}</div>
                <div className="text-xs text-gray-400">chương</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quản Lý Chương</h3>
            <p className="text-sm text-gray-300 mb-4">Xem, thêm, sửa và xóa chương</p>
            <div className="flex items-center text-green-400 text-sm group-hover:text-green-300 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Categories Management */}
          <Link 
            href="/admin/categories"
            className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-900/20 rounded-lg group-hover:bg-purple-900/30 transition-colors duration-300">
                <Tag size={24} className="text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
                <div className="text-xs text-gray-400">thể loại</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quản Lý Thể Loại</h3>
            <p className="text-sm text-gray-300 mb-4">Xem, thêm và xóa thể loại truyện</p>
            <div className="flex items-center text-purple-400 text-sm group-hover:text-purple-300 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Messages Management */}
          <Link 
            href="/admin/messages"
            className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-yellow-600 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-900/20 rounded-lg group-hover:bg-yellow-900/30 transition-colors duration-300">
                <Mail size={24} className="text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{messagesCount}</div>
                <div className="text-xs text-gray-400">tin nhắn</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quản Lý Tin Nhắn</h3>
            <p className="text-sm text-gray-300 mb-4">Xem và quản lý tin nhắn từ người dùng</p>
            <div className="flex items-center text-yellow-400 text-sm group-hover:text-yellow-300 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Users Management */}
          <Link 
            href="/admin/users"
            className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-900/20 rounded-lg group-hover:bg-red-900/30 transition-colors duration-300">
                <Users size={24} className="text-red-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">{usersCount}</div>
                <div className="text-xs text-gray-400">người dùng</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quản Lý Người Dùng</h3>
            <p className="text-sm text-gray-300 mb-4">Xem và quản lý tài khoản người dùng</p>
            <div className="flex items-center text-red-400 text-sm group-hover:text-red-300 transition-colors duration-300">
              Xem chi tiết
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4">
          <div className="bg-gray-900 rounded-lg shadow border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Thao Tác Nhanh</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/admin/new-story"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  <Plus size={18} />
                  Tạo Truyện Mới
                </Link>
                <Link 
                  href="/admin/new-chapter"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center gap-2"
                >
                  <Plus size={18} />
                  Tạo Chương Mới
                </Link>
                <Link
                  href="/stories"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center gap-2"
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
