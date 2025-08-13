'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import Navigation from '../../component/Navigation';
import { LogIn, User, Lock, Home, AlertCircle, Loader2, Mail } from 'lucide-react';

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
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-24">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <LogIn size={48} className="text-blue-400" />
            <h2 className="text-center text-3xl font-extrabold text-white">
              Đăng nhập vào tài khoản
            </h2>
          </div>
          <p className="text-center text-sm text-gray-300">
            Hoặc{' '}
            <Link href="/" className="font-medium text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 mt-2">
              <Home size={16} />
              quay về trang chủ
            </Link>
            <br />
            <Link href="/contact" className="font-medium text-green-400 hover:text-green-300 flex items-center justify-center gap-2 mt-2">
              <Mail size={16} />
              quay về trang liên hệ
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                  <User size={16} />
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock size={16} />
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Đăng nhập
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
