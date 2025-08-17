'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Edit3, Trash2, ArrowLeft, User, Shield, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Navigation from '../../../component/Navigation';
import { storyService } from '../../../services/storyService';

interface User {
  _id: string;
  displayName: string;
  email: string;
  picture?: string;
  createdAt: string;
  lastLogin?: string;
  messageCount: number;
}

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const response = await storyService.getUsers();
      console.log('Users API response:', response);
      console.log('Users data:', response.users);
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setNotification({ type: 'error', message: 'Không thể tải danh sách người dùng!' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteConfirm({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      setIsDeleting(deleteConfirm.id);
      
      // Call actual API to delete user and all related messages
      const response = await storyService.deleteUser(deleteConfirm.id);
      console.log('Delete user response:', response);
      
      // Remove user from local state
      setUsers(users.filter(user => user._id !== deleteConfirm.id));
      
      setNotification({ 
        type: 'success', 
        message: `Đã xóa người dùng "${deleteConfirm.name}" và ${response.deletedMessages} tin nhắn liên quan thành công!` 
      });
      
      setDeleteConfirm(null);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa';
      setNotification({ 
        type: 'error', 
        message: `Lỗi: ${errorMessage}` 
      });
      
      // Auto hide error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    let newStatus: 'active' | 'inactive' | 'banned';
    
    switch (currentStatus) {
      case 'active':
        newStatus = 'inactive';
        break;
      case 'inactive':
        newStatus = 'banned';
        break;
      case 'banned':
        newStatus = 'active';
        break;
      default:
        newStatus = 'active';
    }
    
    setUsers(prev => prev.map(user => 
      user._id === userId ? { ...user, status: newStatus } : user
    ));
    
    setNotification({ 
      type: 'success', 
      message: `Đã cập nhật trạng thái người dùng thành ${newStatus === 'active' ? 'hoạt động' : newStatus === 'inactive' ? 'không hoạt động' : 'bị cấm'}!` 
    });
    
    setTimeout(() => setNotification(null), 3000);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-900/20 text-purple-400 border border-purple-700">
          <Shield size={10} className="mr-1 sm:w-3" />
          <span className="hidden sm:inline">Admin</span>
          <span className="sm:hidden">A</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
        <User size={10} className="mr-1 sm:w-3" />
        <span className="hidden sm:inline">User</span>
        <span className="sm:hidden">U</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-900/20 text-green-400 border border-green-700">
            <span className="hidden sm:inline">Hoạt động</span>
            <span className="sm:hidden">OK</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-700">
            <span className="hidden sm:inline">Không hoạt động</span>
            <span className="sm:hidden">KO</span>
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-red-900/20 text-red-400 border border-red-700">
            <span className="hidden sm:inline">Bị cấm</span>
            <span className="sm:hidden">Cấm</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getActiveUsersCount = () => {
    return users.length; // All guests are considered active
  };

  const getAdminUsersCount = () => {
    return 0; // No admin role for guests
  };

  // Sort users based on current sort criteria
  const getSortedUsers = () => {
    // Users are now sorted by message count from backend
    return users;
  };

  // Avatar component with fallback
  const UserAvatar = ({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-12 w-12',
      md: 'h-16 w-16 sm:h-20 sm:w-20',
      lg: 'h-20 w-20 sm:h-24 sm:w-24'
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24
    };

    // Fix Google OAuth avatar URL
    const getOptimizedAvatarUrl = (url: string) => {
      if (url.includes('googleusercontent.com')) {
        // Remove size parameter and use larger size for better quality
        return url.replace(/=s\d+-c$/, '=s200-c');
      }
      return url;
    };

    // Alternative: Use a proxy service for Google avatars
    const getProxyAvatarUrl = (url: string) => {
      if (url.includes('googleusercontent.com')) {
        // Use a proxy service to avoid CORS issues
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover&output=webp`;
      }
      return url;
    };

    if (!user.picture) {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center`}>
          <User size={iconSizes[size]} className="text-white" />
        </div>
      );
    }

    const optimizedUrl = getOptimizedAvatarUrl(user.picture || '');
    const proxyUrl = getProxyAvatarUrl(user.picture || '');

    return (
      <>
        <img 
          className={`${sizeClasses[size]} rounded-full object-cover`}
          src={proxyUrl} 
          alt={user.displayName}
          onError={(e) => {
            console.error('Avatar load error for user:', user.displayName, 'Original URL:', user.picture, 'Proxy URL:', proxyUrl);
            // Try original URL as fallback
            if (e.currentTarget.src !== user.picture && user.picture) {
              e.currentTarget.src = user.picture;
            } else {
              // Show fallback avatar
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }
          }}
          onLoad={() => {
            console.log('Avatar loaded successfully for user:', user.displayName, 'URL:', proxyUrl);
          }}
        />
        {/* Hidden fallback avatar */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center hidden`}>
          <User size={iconSizes[size]} className="text-white" />
        </div>
      </>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin"
              className="p-1.5 sm:p-2 rounded-md bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm border border-gray-700"
            >
              <ArrowLeft size={16} className="text-gray-300" />
            </Link>
            <div className="flex-1">
              <div className="relative mb-2">
                <h1 className="text-lg sm:text-xl text-white flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  <Users size={20} className="text-red-400" />
                  <span className="hidden sm:inline admin-title font-medium">Quản Lý Người Dùng</span>
                  <span className="sm:hidden admin-title-mobile font-medium">Người Dùng</span>
                </h1>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1">
                <span className="inline-flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  Tổng cộng {users.length} người dùng • {getActiveUsersCount()} hoạt động • {getAdminUsersCount()} admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {getSortedUsers().map((user) => (
            <div key={user._id} className="bg-gray-900/50 rounded-md border border-gray-700 p-4 sm:p-6 hover:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm hover:scale-102">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <UserAvatar user={user} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-1 sm:mb-2">
                        {user.displayName}
                      </h3>
                      
                      {/* Email - Hidden on mobile */}
                      <p className="hidden sm:block text-sm text-gray-300 mb-2">
                        {user.email}
                      </p>
                      
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Calendar size={14} className="sm:w-4" />
                        <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Message Count and Last Login */}
                    <div className="flex flex-col gap-1 sm:gap-2 items-end">
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Mail size={14} />
                        <span>{user.messageCount} tin nhắn</span>
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-400">
                          Đăng nhập: {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email - Mobile */}
                  <div className="sm:hidden mt-2">
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Edit3 size={14} className="sm:w-4" />
                      <span className="hidden sm:inline">Xem</span>
                      <span className="sm:hidden">Xem</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.displayName)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800/50 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Trash2 size={14} className="sm:w-4" />
                      <span className="hidden sm:inline">Xóa</span>
                      <span className="sm:hidden">Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !isLoadingData && (
          <div className="text-center py-12">
            <div className="relative mb-4">
              <Users size={40} className="mx-auto text-gray-500 mb-2" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-base font-medium text-gray-400 mb-2">Chưa có người dùng nào</h3>
            <p className="text-xs text-gray-500 mb-6">Chưa có người dùng nào trong hệ thống</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 px-2 sm:px-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-md p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
              </div>
              <div className="ml-2 sm:ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-blue-400">Quản lý người dùng guest</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-300 space-y-1">
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Hiển thị thông tin từ bảng guest
                  </p>
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Đếm số lượng tin nhắn đã gửi
                  </p>
                  <p className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    Theo dõi hoạt động đăng nhập
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-2xl max-h-full">
            <div className="relative bg-gray-900 rounded-lg shadow border border-gray-800">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-white">Chi tiết người dùng</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserAvatar user={selectedUser} size="sm" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h4 className="text-base sm:text-lg font-medium text-white">{selectedUser.displayName}</h4>
                      <p className="text-xs sm:text-sm text-gray-300">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">Số tin nhắn:</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
                          {selectedUser.messageCount} tin nhắn
                        </span>
                      </div>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-1 text-xs text-gray-500">
                          Debug: messageCount = {selectedUser.messageCount}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">Trạng thái:</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-900/20 text-green-400 border border-green-700">
                          Hoạt động
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Ngày tạo tài khoản:</label>
                    <p className="mt-1 text-xs sm:text-sm text-white">
                      {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">Lần đăng nhập cuối:</label>
                    <p className="mt-1 text-xs sm:text-sm text-white">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-3 sm:px-4 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-4 sm:p-8 border w-full max-w-md max-h-full">
            <div className="relative bg-gray-900 rounded-lg shadow border border-gray-800">
              <div className="p-4 sm:p-6 text-center">
                <svg className="mx-auto mb-4 text-red-400 w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h.08a3 3 0 0 0 2.92 2h2.08a3 3 0 0 0 2.92-2H15a3 3 0 0 1 3 3Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0Z" />
                </svg>
                <h3 className="mb-3 sm:mb-5 text-base sm:text-lg font-normal text-white">
                  Bạn có chắc chắn muốn xóa người dùng "{deleteConfirm.name}" không?
                </h3>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-red-400 bg-red-900/20 p-2 sm:p-3 rounded-md border border-red-700">
                  <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn tài khoản người dùng và tất cả {deleteConfirm ? users.find(u => u._id === deleteConfirm.id)?.messageCount || 0 : 0} tin nhắn liên quan!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <button
                    onClick={confirmDelete}
                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center"
                    disabled={isDeleting === deleteConfirm.id}
                  >
                    {isDeleting === deleteConfirm.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-300 bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center border border-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 z-50 max-w-sm mx-auto sm:mx-0">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 ${
            notification.type === 'success' 
              ? 'bg-green-900/20 border border-green-700 text-green-400' 
              : 'bg-red-900/20 border border-red-700 text-red-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <p className="text-xs sm:text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1 sm:p-1.5 ${
                    notification.type === 'success' 
                      ? 'text-green-400 hover:bg-green-900/20' 
                      : 'text-red-400 hover:bg-red-900/20'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-600`}
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
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
