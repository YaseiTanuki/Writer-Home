'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../component/Navigation';
import GoogleAuthService, { GuestInfo } from '../../services/googleAuthService';
import { LogIn, Shield, Users, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSelectLoginType = async (type: 'guest' | 'admin') => {
    if (type === 'admin') {
      // Redirect to admin login page
      router.push('/login');
    } else if (type === 'guest') {
      // Handle Google login immediately
      try {
        setIsLoading(true);
        setError('');
        
        const authService = GoogleAuthService.getInstance();
        const result = await authService.signInWithGoogle();
        
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
      <div className="pt-24 max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Selection Screen */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <LogIn size={48} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Chọn loại đăng nhập</h1>
          </div>
          
          <p className="text-lg text-gray-300 mb-12">
            Bạn muốn đăng nhập bằng cách nào?
          </p>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Google OAuth Option */}
            <button
              onClick={() => handleSelectLoginType('guest')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-4 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Users size={32} />
                  <div className="text-left">
                    <div className="text-xl font-bold">Đăng nhập với Google</div>
                    <div className="text-sm opacity-90">Người dùng khách</div>
                  </div>
                </>
              )}
            </button>

            {/* Admin Login Option */}
            <button
              onClick={() => handleSelectLoginType('admin')}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-8 py-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-4 shadow-lg hover:shadow-xl"
            >
              <Shield size={32} />
              <div className="text-left">
                <div className="text-xl font-bold">Đăng nhập quản trị</div>
                <div className="text-sm opacity-90">Admin</div>
              </div>
            </button>
          </div>

          <div className="mt-8">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
