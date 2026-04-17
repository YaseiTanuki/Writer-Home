'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGuest } from '../../contexts/GuestContext';
import { LogIn, Shield, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
        if (error instanceof Error && error.message !== 'cancelled') {
          setError(error instanceof Error ? error.message : 'Google sign-in failed');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1e1e2e' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ backgroundColor: 'rgba(203,166,247,0.12)', border: '1px solid rgba(203,166,247,0.25)' }}
          >
            <LogIn size={20} style={{ color: '#cba6f7' }} />
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#cdd6f4' }}>Chọn cách đăng nhập</h1>
          <p className="text-xs" style={{ color: '#6c7086' }}>Bạn muốn đăng nhập bằng cách nào?</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs"
            style={{ backgroundColor: 'rgba(243,139,168,0.08)', border: '1px solid rgba(243,139,168,0.2)', color: '#f38ba8' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#f38ba8' }} />
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Google OAuth */}
          <button
            onClick={() => handleSelectLoginType('guest')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(137,180,250,0.12)' }}>
              {isLoading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#89b4fa', borderTopColor: 'transparent' }} />
                : <Users size={20} style={{ color: '#89b4fa' }} />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
              </div>
              <div className="text-xs" style={{ color: '#6c7086' }}>Người dùng khách</div>
            </div>
          </button>

          {/* Admin login */}
          <button
            onClick={() => handleSelectLoginType('admin')}
            disabled={isLoading}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(203,166,247,0.12)' }}>
              <Shield size={20} style={{ color: '#cba6f7' }} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>Đăng nhập quản trị</div>
              <div className="text-xs" style={{ color: '#6c7086' }}>Admin</div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs transition-colors duration-200"
            style={{ color: '#6c7086' }}
          >
            <ArrowLeft size={13} />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
