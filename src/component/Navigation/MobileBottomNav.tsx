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
      <div className="md:hidden bg-[#121212] border-b-2 border-[#D2691E]/30 fixed top-0 left-0 right-0 z-40">
        <div className="flex justify-center items-center h-12">
          <Link href="/" className="text-base font-bold text-[#D2691E] flex items-center gap-2">
            <BookOpen size={18} />
            Meo Meo Ký
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t-2 border-[#D2691E]/30">
        <div className="flex items-center justify-around px-1 py-1">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all duration-200 ${
              isActive('/') 
                ? 'text-[#D2691E]' 
                : 'text-[#FFFFFF] hover:text-[#D2691E]'
            }`}
          >
            <Home size={18} />
            <span className="text-[10px] mt-0.5 text-center">Trang Chủ</span>
          </Link>

          {/* Stories */}
          <Link
            href="/stories"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all duration-200 ${
              isActive('/stories') || pathname.startsWith('/stories/')
                ? 'text-[#D2691E]' 
                : 'text-[#FFFFFF] hover:text-[#D2691E]'
            }`}
          >
            <BookOpen size={18} />
            <span className="text-[10px] mt-0.5 text-center">Thư Viện</span>
          </Link>

          {/* Messages/Contact Button - Center */}
          {isAdminAuthenticated ? (
            <button
              onClick={toggleMenu}
              className="flex flex-col items-center justify-center w-14 py-1 text-[#FFFFFF] hover:text-[#D2691E] transition-all duration-200"
            >
              <Plus size={18} />
              <span className="text-[10px] mt-0.5 text-center">Tạo Mới</span>
            </button>
          ) : (
            <Link
              href="/contact"
              className="flex flex-col items-center justify-center w-14 py-1 text-[#FFFFFF] hover:text-[#D2691E] transition-all duration-200"
            >
              <Mail size={18} />
              <span className="text-[10px] mt-0.5 text-center">Nhắn tin</span>
            </Link>
          )}

          {/* About */}
          <Link
            href="/about"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all duration-200 ${
              isActive('/about')
                ? 'text-[#D2691E]' 
                : 'text-[#FFFFFF] hover:text-[#D2691E]'
            }`}
          >
            <Info size={18} />
            <span className="text-[10px] mt-0.5 text-center">Về Tôi</span>
          </Link>

          {/* Profile/Auth */}
          <div className="flex flex-col items-center justify-center w-14">
            {isGuestAuthenticated ? (
              <button
                onClick={handleGuestSignOut}
                className="flex flex-col items-center justify-center w-full py-1 text-[#FFFFFF] hover:text-[#D2691E] transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="text-[10px] mt-0.5 text-center">Đăng xuất</span>
              </button>
            ) : isAdminAuthenticated ? (
              <Link
                href="/admin"
                className={`flex flex-col items-center justify-center w-full py-1 transition-all duration-200 ${
                  pathname.startsWith('/admin')
                    ? 'text-[#D2691E]' 
                    : 'text-[#FFFFFF] hover:text-[#D2691E]'
                }`}
              >
                <UserCircle size={18} />
                <span className="text-[10px] mt-0.5 text-center">Quản trị</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="flex flex-col items-center justify-center w-full py-1 text-[#FFFFFF] hover:text-[#D2691E] transition-all duration-200"
              >
                <LogIn size={18} />
                <span className="text-[10px] mt-0.5 text-center">Đăng Nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal - Opens when Create button is clicked */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}>
        <div className="absolute bottom-20 left-4 right-4 bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-medium text-[#FFFFFF]">
                 {isAdminAuthenticated ? 'Tạo Mới' : 'Nhắn tin'}
               </h3>
              <button
                onClick={closeMenu}
                className="text-[#B0BEC5] hover:text-[#FFFFFF] transition-all duration-200"
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
                    className="flex items-center gap-3 p-3 rounded-lg text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#D2691E]/10 transition-all duration-200 border-2 border-transparent hover:border-[#D2691E]/30"
                  >
                    <BookOpen size={20} />
                    <span>Truyện Mới</span>
                  </Link>
                  <Link
                    href="/admin/new-chapter"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#D2691E]/10 transition-all duration-200 border-2 border-transparent hover:border-[#D2691E]/30"
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
                    className="flex items-center gap-3 p-3 rounded-lg text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#D2691E]/10 transition-all duration-200 border-2 border-transparent hover:border-[#D2691E]/30"
                  >
                    <Mail size={20} />
                    <span>Liên hệ & Góp ý</span>
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-[#B0BEC5] hover:text-[#FFFFFF] hover:bg-[#D2691E]/10 transition-all duration-200 border-2 border-transparent hover:border-[#D2691E]/30"
                  >
                    <Mail size={20} />
                    <span>Xem tin nhắn</span>
                  </Link>
                </>
              )}
            </div>

            {/* Authentication section */}
            <div className="pt-3 border-t-2 border-[#D2691E]/30 mt-4">
              {isGuestAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm text-[#B0BEC5] px-3 py-2 bg-[#2A2A2A] rounded-lg border-2 border-[#D2691E]/30">
                    <User size={16} className="inline mr-2" />
                    {guest?.displayName}
                  </div>
                  <button
                    onClick={handleGuestSignOut}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#B0BEC5] hover:text-[#D2691E] hover:bg-[#D2691E]/10 transition-all duration-200 flex items-center gap-2 border-2 border-transparent hover:border-[#D2691E]/30"
                  >
                    <LogOut size={16} />
                    Đăng Xuất Google
                  </button>
                </div>
              ) : isAdminAuthenticated ? (
                <button
                  onClick={handleAdminLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#B0BEC5] hover:text-[#D2691E] hover:bg-[#D2691E]/10 transition-all duration-200 flex items-center gap-2 border-2 border-transparent hover:border-[#D2691E]/30"
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
