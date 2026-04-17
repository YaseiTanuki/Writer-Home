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
  Mail,
  Settings,
} from 'lucide-react';

export default function MobileBottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated, signOut: guestSignOut } = useGuest();

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string, exact = true) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/');

  const handleAdminLogout = () => { adminLogout(); closeMenu(); };
  const handleGuestSignOut = () => { guestSignOut(); closeMenu(); };

  // Reusable tab item style
  const tabStyle = (active: boolean) => ({
    color: active ? '#cba6f7' : '#6c7086',
  });

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 border-b"
        style={{ backgroundColor: '#11111b', borderColor: 'rgba(49,50,68,0.8)' }}
      >
        <div className="flex justify-center items-center h-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: '#cba6f7' }}
          >
            <BookOpen size={18} />
            Meo Meo Ký
          </Link>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{ backgroundColor: '#181825', borderColor: 'rgba(49,50,68,0.8)' }}
      >
        <div className="flex items-center justify-around px-2 py-1.5 safe-area-pb">

          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
            style={tabStyle(isActive('/'))}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Trang Chủ</span>
          </Link>

          {/* Stories */}
          <Link
            href="/stories"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
            style={tabStyle(isActive('/stories', false))}
          >
            <BookOpen size={20} />
            <span className="text-[10px] font-medium">Thư Viện</span>
          </Link>

          {/* Center action */}
          {isAdminAuthenticated ? (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={{ color: '#6c7086' }}
            >
              <Plus size={20} />
              <span className="text-[10px] font-medium">Tạo Mới</span>
            </button>
          ) : (
            <Link
              href="/contact"
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={tabStyle(isActive('/contact'))}
            >
              <Mail size={20} />
              <span className="text-[10px] font-medium">Nhắn tin</span>
            </Link>
          )}

          {/* About */}
          <Link
            href="/about"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
            style={tabStyle(isActive('/about'))}
          >
            <Info size={20} />
            <span className="text-[10px] font-medium">Về Tôi</span>
          </Link>

          {/* Auth slot */}
          {isGuestAuthenticated ? (
            <button
              onClick={handleGuestSignOut}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={{ color: '#f38ba8' }}
            >
              <LogOut size={20} />
              <span className="text-[10px] font-medium">Xuất</span>
            </button>
          ) : isAdminAuthenticated ? (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={tabStyle(isActive('/admin', false))}
            >
              <UserCircle size={20} />
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={tabStyle(isActive('/auth'))}
            >
              <LogIn size={20} />
              <span className="text-[10px] font-medium">Đăng Nhập</span>
            </Link>
          )}

        </div>
      </div>

      {/* ── Mobile Context Menu Modal ── */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end"
          onClick={closeMenu}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full rounded-t-2xl shadow-2xl border-t"
            style={{
              backgroundColor: '#1e1e2e',
              borderColor: 'rgba(69,71,90,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(69,71,90,0.8)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(49,50,68,0.6)' }}>
              <span className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>
                {isAdminAuthenticated ? 'Tạo Mới' : 'Nhắn tin'}
              </span>
              <button onClick={closeMenu} style={{ color: '#6c7086' }} className="hover:opacity-80 transition-opacity">
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <div className="px-4 py-3 space-y-1">
              {isAdminAuthenticated ? (
                <>
                  <Link
                    href="/admin/new-story"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{ color: '#a6adc8' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.6)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <BookOpen size={18} style={{ color: '#cba6f7' }} />
                    Truyện Mới
                  </Link>
                  <Link
                    href="/admin/new-chapter"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{ color: '#a6adc8' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.6)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Plus size={18} style={{ color: '#cba6f7' }} />
                    Chương Mới
                  </Link>
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{ color: '#a6adc8' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.6)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Settings size={18} style={{ color: '#cba6f7' }} />
                    Quản Trị
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{ color: '#a6adc8' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.6)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Mail size={18} style={{ color: '#cba6f7' }} />
                    Liên hệ & Góp ý
                  </Link>
                </>
              )}
            </div>

            {/* Auth actions */}
            {(isGuestAuthenticated || isAdminAuthenticated) && (
              <div className="px-4 pb-5 pt-2 border-t" style={{ borderColor: 'rgba(49,50,68,0.5)' }}>
                {isGuestAuthenticated && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs" style={{ color: '#a6adc8', backgroundColor: 'rgba(49,50,68,0.4)' }}>
                      <User size={14} />
                      {guest?.displayName}
                    </div>
                    <button
                      onClick={handleGuestSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                      style={{ color: '#f38ba8' }}
                    >
                      <LogOut size={16} />
                      Đăng Xuất Google
                    </button>
                  </div>
                )}
                {isAdminAuthenticated && (
                  <button
                    onClick={handleAdminLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{ color: '#f38ba8' }}
                  >
                    <LogOut size={16} />
                    Đăng Xuất Admin
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
