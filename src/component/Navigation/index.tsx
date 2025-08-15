'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';
import { 
  BookOpen, 
  Home, 
  Info, 
  Mail, 
  Settings, 
  LogOut, 
  LogIn, 
  User
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated, signOut: guestSignOut } = useGuest();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleAdminLogout = () => {
    adminLogout();
  };

  const handleGuestSignOut = () => {
    guestSignOut();
  };

  return (
    <nav className="bg-black border-b border-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-bold text-blue-400 flex items-center gap-2">
              <BookOpen size={24} />
              Góc Truyện
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              href="/" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                isActive('/') 
                  ? 'text-blue-400 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home size={16} />
              Trang Chủ
            </Link>
            <Link 
              href="/stories" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                isActive('/stories') || pathname.startsWith('/stories/')
                  ? 'text-blue-400 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BookOpen size={16} />
              Thư Viện
            </Link>
            <Link 
              href="/about" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                isActive('/about')
                  ? 'text-blue-400 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Info size={16} />
              Về Tôi
            </Link>
            <Link 
              href="/contact" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                isActive('/contact')
                  ? 'text-blue-400 bg-blue-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Mail size={16} />
              Liên Hệ
            </Link>
          </div>

          {/* Authentication & Admin Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Guest Authentication */}
            {isGuestAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300 px-2 py-1 rounded bg-gray-800">
                  <User size={14} className="inline mr-1" />
                  {guest?.displayName}
                </span>
                <button
                  onClick={handleGuestSignOut}
                  className="px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng Xuất
                </button>
              </div>
            ) : (
              /* Admin Authentication - Only show when guest is NOT authenticated */
              isAdminAuthenticated ? (
                <>
                  <Link 
                    href="/admin" 
                    className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                      pathname.startsWith('/admin')
                        ? 'text-blue-400 bg-blue-900/20' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Settings size={16} />
                    Quản Trị
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Đăng Xuất Admin
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <LogIn size={16} />
                  Đăng Nhập
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
