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
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CreateStoryRequest>({
    title: '',
    description: '',
    category: [],
    coverImage: '',
    status: 'draft'
  });

  const [storyContent, setStoryContent] = useState('');
  const imageUploadRef = useRef<{ uploadImage: () => Promise<string>; hasNewFile: () => boolean }>(null);

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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    
    switch (fieldName) {
      case 'title':
        return !formData.title ? 'Tiêu đề không được để trống' : null;
      case 'description':
        return !formData.description ? 'Mô tả không được để trống' : null;
      case 'category':
        return formData.category.length === 0 ? 'Vui lòng chọn ít nhất một thể loại' : null;
      case 'coverImage':
        return !formData.coverImage ? 'Vui lòng chọn ảnh bìa cho truyện' : null;
      case 'content':
        return !storyContent.trim() ? 'Nội dung truyện không được để trống' : null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      title: true,
      description: true,
      category: true,
      coverImage: true,
      content: true
    });
    
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
            <div className="relative mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Sparkles size={20} className="text-blue-400 w-5 h-5" />
                Viết Truyện Mới
              </h1>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="p-4 mx-0">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-700/50 text-red-300 text-xs backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                {error}
              </div>
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
                onBlur={() => handleBlur('title')}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập tiêu đề truyện..."
                required
              />
              {getFieldError('title') && (
                <p className="text-red-300 text-xs mt-1">{getFieldError('title')}</p>
              )}
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
                onBlur={() => handleBlur('description')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400"
                placeholder="Nhập mô tả ngắn gọn về truyện..."
                required
              />
              {getFieldError('description') && (
                <p className="text-red-300 text-xs mt-1">{getFieldError('description')}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Thể loại *
              </label>
              <CategorySelector
                selectedCategories={formData.category}
                onChange={(categories: string[]) => {
                  setFormData(prev => ({ ...prev, category: categories }));
                  setTouched(prev => ({ ...prev, category: true }));
                }}
              />
              {getFieldError('category') && (
                <p className="text-red-300 text-xs mt-1">{getFieldError('category')}</p>
              )}
            </div>

            {/* Cover Image */}
            <ImageUpload
              ref={imageUploadRef}
              currentImageUrl={formData.coverImage}
              onImageChange={(imageUrl) => {
                setFormData(prev => ({ ...prev, coverImage: imageUrl }));
                setTouched(prev => ({ ...prev, coverImage: true }));
              }}
              className="mb-4"
            />
            {getFieldError('coverImage') && (
              <p className="text-red-300 text-xs mt-1">{getFieldError('coverImage')}</p>
            )}

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
                  onChange={(content) => {
                    setStoryContent(content);
                    setTouched(prev => ({ ...prev, content: true }));
                  }}
                />
              </div>
              {getFieldError('content') && (
                <p className="text-red-300 text-xs mt-1">{getFieldError('content')}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-md text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
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
