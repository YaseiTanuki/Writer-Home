'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Edit3, Trash2, ArrowLeft, User, Shield, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Navigation from '../../../component/Navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
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
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          lastLogin: new Date().toISOString(),
          avatar: '/admin-avatar.jpg'
        },
        {
          _id: '2',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          role: 'user',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          _id: '3',
          name: 'Trần Thị B',
          email: 'tranthib@example.com',
          role: 'user',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
          _id: '4',
          name: 'Lê Văn C',
          email: 'levanc@example.com',
          role: 'user',
          status: 'inactive',
          createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 30).toISOString()
        },
        {
          _id: '5',
          name: 'Phạm Thị D',
          email: 'phamthid@example.com',
          role: 'user',
          status: 'banned',
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          lastLogin: new Date(Date.now() - 86400000 * 45).toISOString()
        }
      ];
      
      setUsers(mockUsers);
    } catch (err) {
      console.error('Failed to load data:', err);
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
      
      // Mock delete - replace with actual API call
      setUsers(prev => prev.filter(user => user._id !== deleteConfirm.id));
      
      setNotification({ 
        type: 'success', 
        message: 'Đã xóa người dùng thành công!' 
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
    return users.filter(user => user.status === 'active').length;
  };

  const getAdminUsersCount = () => {
    return users.filter(user => user.role === 'admin').length;
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
              className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              <ArrowLeft size={18} className="text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Users size={24} className="text-red-400" />
                <span className="hidden sm:inline">Quản Lý Người Dùng</span>
                <span className="sm:hidden">Người Dùng</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Tổng cộng {users.length} người dùng • {getActiveUsersCount()} hoạt động • {getAdminUsersCount()} admin
              </p>
            </div>
          </div>
        </div>

        {/* Users List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {users.map((user) => (
            <div key={user._id} className="bg-gray-900 rounded-lg border border-gray-800 p-4 sm:p-6 hover:bg-gray-800 transition-colors duration-200">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img 
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover" 
                      src={user.avatar} 
                      alt={user.name} 
                    />
                  ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                      <User size={20} className="text-white sm:w-6" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-white truncate mb-1 sm:mb-2">
                        {user.name}
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

                    {/* Status and Role Badges */}
                    <div className="flex flex-col gap-1 sm:gap-2 items-end">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
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
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Edit3 size={14} className="sm:w-4" />
                      <span className="hidden sm:inline">Xem</span>
                      <span className="sm:hidden">Xem</span>
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.status)}
                      className={`inline-flex items-center justify-center gap-1 px-3 py-2 border text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 ${
                        user.status === 'active' 
                          ? 'border-yellow-600 text-yellow-400 bg-gray-800 hover:bg-yellow-900/20' 
                          : user.status === 'inactive'
                          ? 'border-red-600 text-red-400 bg-gray-800 hover:bg-red-900/20'
                          : 'border-green-600 text-green-400 bg-gray-800 hover:bg-green-900/20'
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {user.status === 'active' ? 'Vô hiệu hóa' : user.status === 'inactive' ? 'Cấm' : 'Kích hoạt'}
                      </span>
                      <span className="sm:hidden">
                        {user.status === 'active' ? 'Vô hiệu' : user.status === 'inactive' ? 'Cấm' : 'Kích hoạt'}
                      </span>
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-xs sm:text-sm font-medium rounded-md text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <Trash2 size={14} className="sm:w-4" />
                        <span className="hidden sm:inline">Xóa</span>
                        <span className="sm:hidden">Xóa</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !isLoadingData && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Chưa có người dùng nào</h3>
            <p className="text-sm text-gray-500 mb-6">Chưa có người dùng nào trong hệ thống</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 px-2 sm:px-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-red-400">Quản lý người dùng</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-300">
                  <p>• Không thể xóa tài khoản admin</p>
                  <p>• Có thể vô hiệu hóa hoặc cấm tài khoản người dùng</p>
                  <p>• Theo dõi hoạt động đăng nhập của người dùng</p>
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
                    <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
                      {selectedUser.avatar ? (
                        <img className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover" src={selectedUser.avatar} alt={selectedUser.name} />
                      ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                          <User size={24} className="text-white sm:w-8" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h4 className="text-base sm:text-lg font-medium text-white">{selectedUser.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-300">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">Vai trò:</label>
                      <div className="mt-1">
                        {getRoleBadge(selectedUser.role)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">Trạng thái:</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedUser.status)}
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
                  <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn tài khoản người dùng và tất cả dữ liệu liên quan!
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
