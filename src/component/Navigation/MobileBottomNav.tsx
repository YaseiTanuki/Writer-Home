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
  Plus, 
  UserCircle, 
  LogIn,
  X,
  User,
  LogOut,
  Mail
} from 'lucide-react';

export default function MobileBottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
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
    <>
      {/* Mobile Top Bar - Only Logo */}
      <div className="md:hidden bg-black border-b border-gray-800 fixed top-0 left-0 right-0 z-40">
        <div className="flex justify-center items-center h-14">
          <Link href="/" className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <BookOpen size={20} />
            Góc Truyện
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800">
        <div className="flex items-center justify-around px-1 py-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-16 py-2 transition-colors duration-200 ${
              isActive('/') 
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1 text-center">Trang Chủ</span>
          </Link>

          {/* Stories */}
          <Link
            href="/stories"
            className={`flex flex-col items-center justify-center w-16 py-2 transition-colors duration-200 ${
              isActive('/stories') || pathname.startsWith('/stories/')
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1 text-center">Thư Viện</span>
          </Link>

          {/* Messages/Contact Button - Center */}
          {isAdminAuthenticated ? (
            <button
              onClick={toggleMenu}
              className="flex flex-col items-center justify-center w-16 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Plus size={20} />
              <span className="text-xs mt-1 text-center">Tạo Mới</span>
            </button>
          ) : (
            <Link
              href="/contact"
              className="flex flex-col items-center justify-center w-16 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Mail size={20} />
              <span className="text-xs mt-1 text-center">Nhắn tin</span>
            </Link>
          )}

          {/* About */}
          <Link
            href="/about"
            className={`flex flex-col items-center justify-center w-16 py-2 transition-colors duration-200 ${
              isActive('/about')
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Info size={20} />
            <span className="text-xs mt-1 text-center">Về Tôi</span>
          </Link>

          {/* Profile/Auth */}
          <div className="flex flex-col items-center justify-center w-16">
            {isGuestAuthenticated ? (
              <button
                onClick={handleGuestSignOut}
                className="flex flex-col items-center justify-center w-full py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <LogOut size={20} />
                <span className="text-xs mt-1 text-center">Đăng xuất</span>
              </button>
            ) : isAdminAuthenticated ? (
              <Link
                href="/admin"
                className="flex flex-col items-center justify-center w-full py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <UserCircle size={20} />
                <span className="text-xs mt-1 text-center">Quản trị</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex flex-col items-center justify-center w-full py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <LogIn size={20} />
                <span className="text-xs mt-1 text-center">Đăng Nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal - Opens when Create button is clicked */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50 bg-black bg-opacity-50`}>
        <div className="absolute bottom-20 left-4 right-4 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-medium text-white">
                 {isAdminAuthenticated ? 'Tạo Mới' : 'Nhắn tin'}
               </h3>
              <button
                onClick={closeMenu}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {isAdminAuthenticated ? (
                <>
                  <Link
                    href="/admin/new-story"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    <BookOpen size={20} />
                    <span>Truyện Mới</span>
                  </Link>
                  <Link
                    href="/admin/new-chapter"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Plus size={20} />
                    <span>Chương Mới</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Mail size={20} />
                    <span>Liên hệ & Góp ý</span>
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Mail size={20} />
                    <span>Xem tin nhắn</span>
                  </Link>
                </>
              )}
            </div>

            {/* Authentication section */}
            <div className="pt-3 border-t border-gray-700 mt-4">
              {isGuestAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 px-3 py-2 bg-gray-800 rounded-lg">
                    <User size={16} className="inline mr-2" />
                    {guest?.displayName}
                  </div>
                  <button
                    onClick={handleGuestSignOut}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Đăng Xuất Google
                  </button>
                </div>
              ) : isAdminAuthenticated ? (
                <button
                  onClick={handleAdminLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng Xuất Admin
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
