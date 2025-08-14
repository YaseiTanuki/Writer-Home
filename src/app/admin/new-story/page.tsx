'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateStoryRequest } from '../../../types/story';
import TiptapEditor from '../../../component/TiptapEditor';
import CategorySelector from '../../../component/CategorySelector';
import Navigation from '../../../component/Navigation';
import { Sparkles, Plus } from 'lucide-react';

export default function NewStoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateStoryRequest>({
    title: '',
    description: '',
    category: [],
    coverImage: '',
    status: 'draft'
  });

  const [storyContent, setStoryContent] = useState('');

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={80}
                height={80}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-gray-300">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.category.length === 0 || !formData.coverImage || !storyContent.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Combine form data with story content
      const storyData = {
        ...formData,
        content: storyContent
      };
      
      const response = await storyService.createStory(storyData);
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo truyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-3">
                <Sparkles size={28} className="text-blue-400" />
                Viết Truyện Mới
              </h1>
            </div>

          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-3 sm:px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Tiêu đề truyện *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white placeholder-gray-400"
              placeholder="Nhập tiêu đề truyện..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả truyện *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white placeholder-gray-400"
              placeholder="Nhập mô tả ngắn gọn về truyện..."
              required
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thể loại *
            </label>
            <CategorySelector
              selectedCategories={formData.category}
              onChange={(categories: string[]) => setFormData(prev => ({ ...prev, category: categories }))}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
              Ảnh bìa *
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white placeholder-gray-400"
              placeholder="Nhập URL ảnh bìa..."
              required
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-800 text-white"
            >
              <option value="draft">Bản thảo</option>
              <option value="public">Xuất bản</option>
            </select>
          </div>

          {/* Story Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nội dung truyện *
            </label>
            <div className="border border-gray-600 rounded-md">
              <TiptapEditor
                content={storyContent}
                onChange={setStoryContent}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="relative w-5 h-5">
                    <Image
                      src="/reading.gif"
                      alt="Creating..."
                      width={20}
                      height={20}
                      className="rounded w-full h-full object-cover"
                    />
                  </div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Tạo Truyện
                </>
              )}
            </button>
                                                   <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center border border-gray-600"
              >
                Hủy
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
