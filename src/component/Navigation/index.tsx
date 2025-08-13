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
  Menu, 
  X,
  User
} from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated, signOut: guestSignOut } = useGuest();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleAdminLogout = () => {
    adminLogout();
    closeMenu();
  };

  const handleGuestSignOut = () => {
    guestSignOut();
    closeMenu();
  };

  return (
    <nav className="bg-black border-b border-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-bold text-blue-400 flex items-center gap-2">
              <BookOpen size={24} />
              Góc Truyện
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
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
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Mở menu chính</span>
              {/* Icon when menu is closed */}
              <Menu
                className={`${isMenuOpen ? 'hidden' : 'block'} h-5 w-5 sm:h-6 sm:w-6`}
                aria-hidden="true"
              />
              {/* Icon when menu is open */}
              <X
                className={`${isMenuOpen ? 'block' : 'hidden'} h-5 w-5 sm:h-6 sm:w-6`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black border-t border-gray-800 shadow-lg">
          <Link
            href="/"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
              isActive('/')
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Home size={20} />
            Trang Chủ
          </Link>
          <Link
            href="/stories"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
              isActive('/stories') || pathname.startsWith('/stories/')
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <BookOpen size={20} />
            Thư Viện
          </Link>
          <Link
            href="/about"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
              isActive('/about')
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Info size={20} />
            Về Tôi
          </Link>
          <Link
            href="/contact"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
              isActive('/contact')
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Mail size={20} />
            Liên Hệ
          </Link>
          
          {/* Authentication section for mobile */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            {/* Guest Authentication */}
            {isGuestAuthenticated ? (
              <div className="px-3 py-2 bg-gray-800 rounded-md">
                <div className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                  <User size={16} />
                  {guest?.displayName}
                </div>
                <button
                  onClick={handleGuestSignOut}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng Xuất Google
                </button>
              </div>
            ) : (
              /* Admin Authentication - Only show when guest is NOT authenticated */
              isAdminAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-3 ${
                      pathname.startsWith('/admin')
                        ? 'text-blue-400 bg-blue-900/20'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Settings size={20} />
                    Quản Trị
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-3"
                  >
                    <LogOut size={20} />
                    Đăng Xuất Admin
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={closeMenu}
                  className="bg-blue-600 hover:bg-blue-700 text-white block w-full text-center px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-center gap-3"
                >
                  <LogIn size={20} />
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
