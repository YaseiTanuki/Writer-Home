'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900">
              📚 Writer Home
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            <Link 
              href="/" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🏠 Trang Chủ
            </Link>
            <Link 
              href="/stories" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/stories') || pathname.startsWith('/stories/')
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📖 Thư Viện
            </Link>
            <Link 
              href="/admin" 
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname.startsWith('/admin')
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ⚙️ Quản Trị
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Mở menu chính</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-5 w-5 sm:h-6 sm:w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-5 w-5 sm:h-6 sm:w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
          <Link
            href="/"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
              isActive('/')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🏠 Trang Chủ
          </Link>
          <Link
            href="/stories"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
              isActive('/stories') || pathname.startsWith('/stories/')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📖 Thư Viện Truyện
          </Link>
          <Link
            href="/admin"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
              pathname.startsWith('/admin')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ⚙️ Quản Trị
          </Link>
        </div>
      </div>
    </nav>
  );
}
