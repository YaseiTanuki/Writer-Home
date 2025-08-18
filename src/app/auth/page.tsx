'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../component/Navigation';
import { useGuest } from '../../contexts/GuestContext';
import { LogIn, Shield, Users, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signInWithGoogle } = useGuest();

  const handleSelectLoginType = async (type: 'guest' | 'admin') => {
    if (type === 'admin') {
      // Redirect to admin login page
      router.push('/login');
    } else if (type === 'guest') {
      // Handle Google login immediately
      try {
        setIsLoading(true);
        setError('');
        
        await signInWithGoogle();
        
        // Redirect to home page after successful Google login
        router.push('/');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Google sign-in failed');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-16 md:pt-24 max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Selection Screen */}
        <div className="text-center">
          <div className="relative mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <LogIn size={28} className="text-pink-400 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-2xl font-bold text-white bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">Chọn loại đăng nhập</h1>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-xs sm:text-base text-gray-300 mb-8 sm:mb-12">
            Bạn muốn đăng nhập bằng cách nào?
          </p>

          {error && (
            <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-700/50 text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-xs backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Google OAuth Option */}
            <button
              onClick={() => handleSelectLoginType('guest')}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-pink-800 disabled:to-rose-800 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                    <Image
                      src="/reading.gif"
                      alt="Processing..."
                      width={20}
                      height={20}
                      className="rounded w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs sm:text-base">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Users size={28} className="sm:w-8 sm:h-8" />
                  <div className="text-center">
                    <div className="text-sm sm:text-xl font-bold">Đăng nhập với Google</div>
                    <div className="text-xs opacity-90">Người dùng khách</div>
                  </div>
                </>
              )}
            </button>

            {/* Admin Login Option */}
            <button
              onClick={() => handleSelectLoginType('admin')}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-rose-800 disabled:to-pink-800 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Shield size={28} className="sm:w-8 sm:h-8" />
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold">Đăng nhập quản trị</div>
                <div className="text-xs opacity-90">Admin</div>
              </div>
            </button>
          </div>

          <div className="mt-6 sm:mt-8">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-base">Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
