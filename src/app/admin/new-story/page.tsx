'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateStoryRequest } from '../../../types/story';
import TiptapEditor from '../../../component/TiptapEditor';
import CategorySelector from '../../../component/CategorySelector';
import Navigation from '../../../component/Navigation';
import ImageUpload from '../../../component/ImageUpload';
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
  const imageUploadRef = useRef<{ uploadImage?: () => Promise<string>; hasNewFile?: () => boolean }>(null);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={64}
                height={64}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 text-gray-300 text-xs">Đang tải...</p>
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
    
    if (!formData.title || !formData.description || formData.category.length === 0 || !storyContent.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Upload image first if there's a selected file
      let coverImageUrl = formData.coverImage;
      
      // Only upload if there's actually a new file selected
      if (imageUploadRef?.current?.uploadImage && imageUploadRef?.current?.hasNewFile?.()) {
        try {
          coverImageUrl = await imageUploadRef.current.uploadImage();
        } catch (uploadError) {
          setError('Không thể upload ảnh. Vui lòng thử lại.');
          return;
        }
      } else if (!coverImageUrl) {
        // For new story, require an image
        setError('Vui lòng chọn ảnh bìa cho truyện');
        return;
      }
      
      // Combine form data with story content
      const storyData = {
        ...formData,
        coverImage: coverImageUrl,
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
      <div className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6 mt-4 px-4">
          <div className="text-center">
            <h1 className="text-sm font-bold text-white mb-2 leading-tight flex items-center justify-center gap-2">
              <Sparkles size={20} className="text-blue-400 w-5 h-5" />
              Viết Truyện Mới
            </h1>
          </div>
        </div>

        <div className="p-4 mx-0">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-700 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-0">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-gray-300 mb-2">
                Tiêu đề truyện *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập tiêu đề truyện..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-2">
                Mô tả truyện *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập mô tả ngắn gọn về truyện..."
                required
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Thể loại *
              </label>
              <CategorySelector
                selectedCategories={formData.category}
                onChange={(categories: string[]) => setFormData(prev => ({ ...prev, category: categories }))}
              />
            </div>

            {/* Cover Image */}
            <ImageUpload
              ref={imageUploadRef}
              currentImageUrl={formData.coverImage}
              onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, coverImage: imageUrl }))}
              className="mb-4"
            />

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white"
              >
                <option value="draft">Bản thảo</option>
                <option value="public">Xuất bản</option>
              </select>
            </div>

            {/* Story Content */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-xs font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="relative w-4 h-4">
                      <Image
                        src="/reading.gif"
                        alt="Creating..."
                        width={16}
                        height={16}
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} className="w-4 h-4" />
                    <span className="text-xs">Tạo Truyện</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-md font-medium transition-colors duration-200 text-center border border-gray-600 text-xs"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
