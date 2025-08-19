'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../component/Navigation';
import { LogIn, User, Lock, Home, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
              <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative">
              <LogIn size={28} className="text-pink-400 sm:w-8 sm:h-8" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-center text-lg sm:text-2xl font-extrabold text-white bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">
              Đăng nhập vào tài khoản
            </h2>
          </div>
          <p className="text-center text-xs text-gray-300">
            Vui lòng đăng nhập để truy cập trang quản trị
          </p>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#1E1E1E] shadow-lg rounded-2xl py-4 sm:py-6 px-3 sm:px-4 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-[#D2691E]/10 border-2 border-[#D2691E]/30 text-[#D2691E] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 bg-[#D2691E] rounded-full"></div>
                  <AlertCircle size={16} className="sm:w-4 sm:h-4" />
                  <span className="text-xs">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-xs font-medium text-[#B0BEC5] flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  <User size={14} className="sm:w-4 sm:h-4" />
                  Tên đăng nhập
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm placeholder-[#B0BEC5] focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] text-xs transition-all duration-200"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-[#B0BEC5] flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  <Lock size={14} className="sm:w-4 sm:h-4" />
                  Mật khẩu
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm placeholder-[#B0BEC5] focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] text-xs transition-all duration-200"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-3 sm:px-4 border border-transparent rounded-lg shadow-md text-xs font-medium text-[#1E1E1E] bg-[#00E5FF] hover:bg-[#00E5FF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E5FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                        <Image
                          src="/reading.gif"
                          alt="Logging in..."
                          width={20}
                          height={20}
                          className="rounded w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs">Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} className="sm:w-5 sm:h-5" />
                      <span className="text-xs">Đăng nhập</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
