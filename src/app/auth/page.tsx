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
        
        // Redirect to contact page after successful Google login
        router.push('/contact');
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
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <LogIn size={40} className="text-blue-400 sm:w-12 sm:h-12" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Chọn loại đăng nhập</h1>
          </div>
          
          <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12">
            Bạn muốn đăng nhập bằng cách nào?
          </p>

          {error && (
            <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-700 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Google OAuth Option */}
            <button
              onClick={() => handleSelectLoginType('guest')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl"
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
                  <span className="text-sm sm:text-base">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Users size={28} className="sm:w-8 sm:h-8" />
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-bold">Đăng nhập với Google</div>
                    <div className="text-xs sm:text-sm opacity-90">Người dùng khách</div>
                  </div>
                </>
              )}
            </button>

            {/* Admin Login Option */}
            <button
              onClick={() => handleSelectLoginType('admin')}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-xl font-medium transition-colors duration-200 flex items-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl"
            >
              <Shield size={28} className="sm:w-8 sm:h-8" />
              <div className="text-left">
                <div className="text-lg sm:text-xl font-bold">Đăng nhập quản trị</div>
                <div className="text-xs sm:text-sm opacity-90">Admin</div>
              </div>
            </button>
          </div>

          <div className="mt-6 sm:mt-8">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
