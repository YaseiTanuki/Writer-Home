'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { storyService } from '../../services/storyService';
import { Story, Chapter } from '../../types/story';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
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
      const [storiesResponse, chaptersResponse] = await Promise.all([
        storyService.getStories(),
        storyService.getAllChapters()
      ]);
      
      setStories(storiesResponse.stories);
      setChapters(chaptersResponse.chapters);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Quản Trị</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Xin chào, {user?.username}!</span>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Xem Trang Web
              </Link>
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Đăng xuất
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Tổng Số Truyện</div>
            <div className="text-3xl font-bold text-gray-900">{stories.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Đã Xuất Bản</div>
            <div className="text-3xl font-bold text-green-600">
              {stories.filter(s => s.status === 'public').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Bản Thảo</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stories.filter(s => s.status === 'draft').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Tổng Số Chương</div>
            <div className="text-3xl font-bold text-blue-600">{chapters.length}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Thao Tác Nhanh</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/admin/new-story"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Truyện Mới
              </Link>
              <Link 
                href="/admin/new-chapter"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                + Chương Mới
              </Link>
              <Link
                href="/stories"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Xem Trang Công Khai
              </Link>
            </div>
          </div>
        </div>

        {/* Stories Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Truyện Gần Đây</h2>
          </div>
          <div className="overflow-x-auto">
            {stories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có truyện nào. Hãy tạo truyện đầu tiên!
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu Đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày Tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stories.slice(0, 5).map((story) => (
                    <tr key={story._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{story.title}</div>
                        <div className="text-sm text-gray-500">{story.description}</div>
                        {story.content && (
                          <div className="text-xs text-gray-400 mt-1">
                            {story.content.length > 100 
                              ? `${story.content.substring(0, 100)}...` 
                              : story.content
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          story.status === 'public' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {story.status === 'public' ? 'Công khai' : 'Bản thảo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/stories/${story._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Sửa
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Chương Gần Đây</h2>
          </div>
          <div className="overflow-x-auto">
            {chapters.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có chương nào. Hãy tạo chương đầu tiên!
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chương
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu Đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Truyện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày Tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chapters.slice(0, 5).map((chapter) => (
                    <tr key={chapter._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Chương {chapter.chapterNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{chapter.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {chapter.storyId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/chapters/${chapter._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Sửa
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
