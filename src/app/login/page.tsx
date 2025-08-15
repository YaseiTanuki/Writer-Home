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
            <LogIn size={40} className="text-blue-400 sm:w-12 sm:h-12" />
            <h2 className="text-center text-sm sm:text-3xl font-extrabold text-white">
              Đăng nhập vào tài khoản
            </h2>
          </div>
          <p className="text-center text-xs text-gray-300">
            Vui lòng đăng nhập để truy cập trang quản trị
          </p>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-900 py-6 sm:py-8 px-3 sm:px-4 shadow sm:rounded-lg sm:px-8 sm:px-10 border border-gray-800">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded flex items-center gap-2 sm:gap-3">
                  <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-xs">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-300 flex items-center gap-1.5 sm:gap-2">
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
                    className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white text-xs"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 flex items-center gap-1.5 sm:gap-2">
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
                    className="appearance-none block w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white text-xs"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
