'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function NavigationBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Góc Truyện
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Trang Chủ
              </Link>
              <Link
                href="/stories"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Truyện
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Về Tôi
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Liên hệ
              </Link>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Quản lý
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            <Link
              href="/stories"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Truyện
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Về Tôi
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>
            <div className="pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="bg-blue-600 hover:bg-blue-700 text-white block w-full text-center px-4 py-2 rounded-md text-base font-medium mb-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Quản lý
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white block w-full text-center px-4 py-2 rounded-md text-base font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white block w-full text-center px-4 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
