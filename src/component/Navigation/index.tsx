'use client';

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

const NAV_LINKS = [
  { href: '/',         label: 'Trang Chủ', icon: Home,     exact: true },
  { href: '/stories',  label: 'Thư Viện',  icon: BookOpen, exact: false },
  { href: '/about',    label: 'Về Tôi',    icon: Info,     exact: true },
  { href: '/contact',  label: 'Liên Hệ',   icon: Mail,     exact: true },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated, signOut: guestSignOut } = useGuest();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: '#181825',          /* ctp-mantle */
        borderColor: 'rgba(69,71,90,0.6)',   /* ctp-surface1 */
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ color: '#cba6f7' /* ctp-mauve */ }}
          >
            <BookOpen size={20} />
            Meo Meo Ký
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={active ? {
                    color: '#cba6f7',
                    backgroundColor: 'rgba(203,166,247,0.12)',
                  } : {
                    color: '#a6adc8',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.7)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isGuestAuthenticated ? (
              <>
                <span
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: '#a6adc8', backgroundColor: 'rgba(49,50,68,0.6)' }}
                >
                  <User size={13} />
                  {guest?.displayName}
                </span>
                <button
                  onClick={guestSignOut}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                  style={{ color: '#a6adc8' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#f38ba8';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(243,139,168,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={14} />
                  Đăng Xuất
                </button>
              </>
            ) : isAdminAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                  style={
                    pathname.startsWith('/admin')
                      ? { color: '#cba6f7', backgroundColor: 'rgba(203,166,247,0.12)' }
                      : { color: '#a6adc8' }
                  }
                  onMouseEnter={e => {
                    if (!pathname.startsWith('/admin')) {
                      (e.currentTarget as HTMLElement).style.color = '#cdd6f4';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(49,50,68,0.7)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!pathname.startsWith('/admin')) {
                      (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Settings size={14} />
                  Quản Trị
                </Link>
                <button
                  onClick={adminLogout}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                  style={{ color: '#a6adc8' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#f38ba8';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(243,139,168,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#a6adc8';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={14} />
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: '#cba6f7',
                  color: '#1e1e2e',
                }}
              >
                <LogIn size={14} />
                Đăng Nhập
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
