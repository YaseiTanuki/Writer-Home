'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, FileText, CheckCircle, Tag, Plus, Settings, Mail, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storyService } from '../../services/storyService';
import { Story, Chapter, Category } from '../../types/story';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#cba6f7', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full text-xs" style={{ color: '#cba6f7', backgroundColor: 'rgba(203,166,247,0.1)', border: '1px solid rgba(203,166,247,0.2)' }}>
            <Settings size={12} />
            Quản Trị
          </div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#cdd6f4' }}>Bảng Điều Khiển</h1>
          <p className="text-xs mt-1" style={{ color: '#6c7086' }}>Quản lý toàn bộ hệ thống truyện và người dùng</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <BookOpen size={18} />, value: stories.length, label: 'Truyện', color: '#89b4fa' },
            { icon: <FileText size={18} />, value: chapters.filter(c => (c.status || 'public') === 'public').length, label: 'Chương', color: '#a6e3a1' },
            { icon: <Tag size={18} />, value: categories.length, label: 'Thể Loại', color: '#fab387' },
            { icon: <CheckCircle size={18} />, value: stories.filter(s => s.status === 'public').length, label: 'Đã Xuất Bản', color: '#94e2d5' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
              <div className="flex items-center justify-center w-9 h-9 mx-auto mb-2 rounded-lg" style={{ backgroundColor: `${stat.color}18` }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: '#cdd6f4' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: stat.color }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/admin/stories', icon: <BookOpen size={20} />, count: stories.length, unit: 'truyện', title: 'Quản Lý Truyện', desc: 'Xem, thêm, sửa và xóa truyện', color: '#89b4fa' },
            { href: '/admin/chapters', icon: <FileText size={20} />, count: chapters.filter(c => (c.status || 'public') === 'public').length, unit: 'chương', title: 'Quản Lý Chương', desc: 'Xem, thêm, sửa và xóa chương', color: '#a6e3a1' },
            { href: '/admin/categories', icon: <Tag size={20} />, count: categories.length, unit: 'thể loại', title: 'Quản Lý Thể Loại', desc: 'Xem, thêm và xóa thể loại truyện', color: '#fab387' },
            { href: '/admin/messages', icon: <Mail size={20} />, count: messagesCount, unit: 'tin nhắn', title: 'Quản Lý Tin Nhắn', desc: 'Xem và quản lý tin nhắn từ người dùng', color: '#f5c2e7' },
            { href: '/admin/users', icon: <Users size={20} />, count: usersCount, unit: 'người dùng', title: 'Quản Lý Người Dùng', desc: 'Xem và quản lý tài khoản người dùng', color: '#94e2d5' },
          ].map((nav, i) => (
            <Link
              key={i}
              href={nav.href}
              className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${nav.color}18` }}>
                  <span style={{ color: nav.color }}>{nav.icon}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: nav.color }}>{nav.count}</div>
                  <div className="text-xs" style={{ color: '#6c7086' }}>{nav.unit}</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#cdd6f4' }}>{nav.title}</h3>
              <p className="text-xs" style={{ color: '#6c7086' }}>{nav.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="rounded-2xl" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid #45475a' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Thao Tác Nhanh</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-3">
              <Link href="/admin/new-story" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: '#cba6f7', color: '#11111b' }}>
                <Plus size={14} /> Tạo Truyện Mới
              </Link>
              <Link href="/admin/new-chapter" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: '#89b4fa', color: '#11111b' }}>
                <Plus size={14} /> Tạo Chương Mới
              </Link>
              <Link href="/stories" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: '#a6e3a1', color: '#11111b' }}>
                <BookOpen size={14} /> Xem Trang Công Khai
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
