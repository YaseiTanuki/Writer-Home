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
    <nav className="bg-[#121212] border-b-2 border-[#FF4081]/30 shadow-lg fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-sm sm:text-xl font-bold text-[#FF4081] flex items-center gap-2">
              <BookOpen size={24} />
              Góc Truyện
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              href="/" 
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/') 
                  ? 'text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]' 
                  : 'text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#1E1E1E] border-2 border-transparent hover:border-[#FF4081]/30'
              }`}
            >
              <Home size={16} />
              Trang Chủ
            </Link>
            <Link 
              href="/stories" 
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/stories') || pathname.startsWith('/stories/')
                  ? 'text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]' 
                  : 'text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#1E1E1E] border-2 border-transparent hover:border-[#FF4081]/30'
              }`}
            >
              <BookOpen size={16} />
              Thư Viện
            </Link>
            <Link 
              href="/about" 
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/about')
                  ? 'text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]' 
                  : 'text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#1E1E1E] border-2 border-transparent hover:border-[#FF4081]/30'
              }`}
            >
              <Info size={16} />
              Về Tôi
            </Link>
            <Link 
              href="/contact" 
              className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/contact')
                  ? 'text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]' 
                  : 'text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#1E1E1E] border-2 border-transparent hover:border-[#FF4081]/30'
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
                <span className="text-xs text-[#B0BEC5] px-2 py-1 rounded-lg bg-[#1E1E1E] border-2 border-[#B39DDB]/50">
                  <User size={14} className="inline mr-1" />
                  {guest?.displayName}
                </span>
                <button
                  onClick={handleGuestSignOut}
                  className="px-2 sm:px-3 py-2 rounded-lg text-xs font-medium text-[#B0BEC5] hover:text-[#FF4081] hover:bg-[#FF4081]/10 transition-all duration-200 flex items-center gap-2 border-2 border-transparent hover:border-[#FF4081]/50"
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
                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                      pathname.startsWith('/admin')
                        ? 'text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]' 
                        : 'text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#1E1E1E] border-2 border-transparent hover:border-[#FF4081]/30'
                    }`}
                  >
                    <Settings size={16} />
                    Quản Trị
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="px-2 sm:px-3 py-2 rounded-lg text-xs font-medium text-[#B0BEC5] hover:text-[#FF4081] hover:bg-[#FF4081]/10 transition-all duration-200 flex items-center gap-2 border-2 border-transparent hover:border-[#FF4081]/50"
                  >
                    <LogOut size={16} />
                    Đăng Xuất Admin
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-[#FF4081] hover:bg-[#FF4081]/92 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
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
