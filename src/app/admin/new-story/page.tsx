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
            <p className="mt-4 text-[#F4E3D2] text-xs">Đang tải...</p>
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
      <div className="pt-16 md:pt-24 max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFF8F0] mb-2 leading-tight flex items-center justify-center sm:justify-start gap-2">
              <Sparkles size={22} className="text-[#00E5FF]" />
              Viết Truyện Mới
            </h1>
            <p className="text-xs sm:text-sm text-[#F4E3D2]">
              Tạo truyện mới cho độc giả của bạn
            </p>
          </div>
        </div>

        {/* Creation Banner */}
        <div className="mb-6 p-3 sm:p-4 rounded-md bg-gradient-to-r from-[#D2691E]/20 to-[#C97C4B]/20 border border-[#D2691E]/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></div>
            <p className="text-xs sm:text-sm font-medium text-[#F4E3D2]">
              Sẵn sàng tạo truyện mới? Hãy điền đầy đủ thông tin bên dưới
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-700/50 text-red-300 text-xs backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-900/50 rounded-md p-4 border border-[#D2691E]">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-3 bg-[#00E5FF] rounded-full"></div>
              Thông Tin Cơ Bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-xs font-medium text-[#F4E3D2] mb-1.5">
                  Tiêu đề truyện *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className="w-full px-3 py-2 border border-[#00E5FF]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-black text-[#FFF8F0] placeholder-[#F4E3D2]/60 transition-all duration-200"
                  placeholder="Nhập tiêu đề truyện..."
                  required
                />
                {getFieldError('title') && (
                  <p className="text-red-300 text-xs mt-1">{getFieldError('title')}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-xs font-medium text-[#F4E3D2] mb-1.5">
                  Mô tả truyện *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#00E5FF]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-black text-[#FFF8F0] placeholder-[#F4E3D2]/60 transition-all duration-200 resize-none"
                  placeholder="Nhập mô tả ngắn gọn về truyện..."
                  required
                />
                {getFieldError('description') && (
                  <p className="text-red-300 text-xs mt-1">{getFieldError('description')}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-[#F4E3D2] mb-1.5">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#00E5FF]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-black text-[#FFF8F0] transition-all duration-200"
                >
                  <option value="draft">Bản thảo</option>
                  <option value="public">Xuất bản</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-gray-900/50 rounded-md p-4 border border-[#D2691E]">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-3 bg-[#F4A460] rounded-full"></div>
              Thể Loại Truyện
            </h2>
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

          {/* Cover Image Section */}
          <div className="bg-gray-900/50 rounded-md p-4 border border-[#D2691E]">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-3 bg-[#E9967A] rounded-full"></div>
              Ảnh Bìa Truyện
            </h2>
            <ImageUpload
              ref={imageUploadRef}
              currentImageUrl={formData.coverImage}
              onImageChange={(imageUrl) => {
                setFormData(prev => ({ ...prev, coverImage: imageUrl }));
                setTouched(prev => ({ ...prev, coverImage: true }));
              }}
            />
            {getFieldError('coverImage') && (
              <p className="text-red-300 text-xs mt-1">{getFieldError('coverImage')}</p>
            )}
          </div>

          {/* Story Content Section */}
          <div className="bg-gray-900/50 rounded-md p-4 border border-[#D2691E]">
            <h2 className="text-base font-semibold text-[#FFF8F0] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-3 bg-[#C97C4B] rounded-full"></div>
              Nội Dung Truyện
            </h2>
            <div className="border border-[#00E5FF]/30 rounded-md overflow-hidden">
              <TiptapEditor
                content={storyContent}
                onChange={(content) => {
                  setStoryContent(content);
                  setTouched(prev => ({ ...prev, content: true }));
                }}
                placeholder="Viết nội dung truyện của bạn..."
              />
            </div>
            {getFieldError('content') && (
              <p className="text-red-300 text-xs mt-1">{getFieldError('content')}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-900/50 rounded-md p-4 border border-[#D2691E]">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-102"
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
                    <span className="text-sm">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span className="text-sm">Tạo Truyện</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 sm:flex-none bg-black hover:bg-gray-900 text-[#F4E3D2] px-6 py-3 rounded-md font-medium transition-all duration-200 text-center text-sm border border-[#D2691E] hover:border-[#C97C4B] transform hover:scale-102"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
