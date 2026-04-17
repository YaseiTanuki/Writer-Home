'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

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
          <h1 className="text-xl font-bold mb-1" style={{ color: '#cdd6f4' }}>Đăng nhập</h1>
          <p className="text-xs" style={{ color: '#6c7086' }}>Truy cập trang quản trị</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#313244', border: '1px solid #45475a' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>

            {error && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                style={{ backgroundColor: 'rgba(243,139,168,0.08)', border: '1px solid rgba(243,139,168,0.2)', color: '#f38ba8' }}
              >
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: '#a6adc8' }}>
                <User size={13} />
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-200"
                style={{ backgroundColor: '#181825', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: '#a6adc8' }}>
                <Lock size={13} />
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all duration-200"
                style={{ backgroundColor: '#181825', color: '#cdd6f4', border: '1px solid #45475a', caretColor: '#cba6f7' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#cba6f7', color: '#11111b' }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-[#11111b] border-t-transparent rounded-full animate-spin" />Đang đăng nhập...</>
              ) : (
                <><LogIn size={16} />Đăng nhập</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
