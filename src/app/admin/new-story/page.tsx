'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateStoryRequest } from '../../../types/story';
import TiptapEditor from '../../../component/TiptapEditor';
import CategorySelector from '../../../component/CategorySelector';
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

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('storyDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setStoryContent(draft.content);
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-save draft functionality
  useEffect(() => {
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (formData.title || storyContent.trim()) {
        const draft = {
          formData,
          content: storyContent,
          timestamp: Date.now()
        };
        localStorage.setItem('storyDraft', JSON.stringify(draft));
      }
    }, 30000);

    // Save draft before page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title || storyContent.trim()) {
        const draft = {
          formData,
          content: storyContent,
          timestamp: Date.now()
        };
        localStorage.setItem('storyDraft', JSON.stringify(draft));
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save draft on component unmount
      if (formData.title || storyContent.trim()) {
        const draft = {
          formData,
          content: storyContent,
          timestamp: Date.now()
        };
        localStorage.setItem('storyDraft', JSON.stringify(draft));
      }
    };
  }, [formData, storyContent]);

  const saveDraft = () => {
    if (formData.title || storyContent.trim()) {
      const draft = {
        formData,
        content: storyContent,
        timestamp: Date.now()
      };
      localStorage.setItem('storyDraft', JSON.stringify(draft));
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('storyDraft');
  };

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={64}
                height={64}
                className="rounded-lg w-full h-full object-cover"
                unoptimized
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
      
      // Clear draft on successful creation
      clearDraft();
      
      // Redirect to stories list on success
      router.push('/admin/stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo truyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-[#cdd6f4] mb-2 leading-tight flex items-center justify-center sm:justify-start gap-2">
              <Sparkles size={22} className="text-[#89b4fa]" />
              Viết Truyện Mới
            </h1>
            <p className="text-xs sm:text-sm text-[#F4E3D2]">
              Tạo truyện mới cho độc giả của bạn
            </p>
          </div>
        </div>

        {/* Creation Banner */}
        <div className="mb-6 p-3 sm:p-4 rounded-md bg-gradient-to-r from-[#cba6f7]/10 to-[#b4befe]/10 border border-[#45475a]/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#89b4fa] rounded-full animate-pulse"></div>
              <p className="text-xs sm:text-sm font-medium text-[#F4E3D2]">
                Sẵn sàng tạo truyện mới? Hãy điền đầy đủ thông tin bên dưới
              </p>
            </div>
            {localStorage.getItem('storyDraft') && (
              <button
                type="button"
                onClick={clearDraft}
                className="text-xs text-[#89b4fa] hover:text-[#89b4fa]/80 underline"
              >
                Xóa bản thảo
              </button>
            )}
          </div>
        </div>

        {/* Draft Loaded Banner */}
        {localStorage.getItem('storyDraft') && (
          <div className="mb-4 p-3 rounded-md bg-[#89b4fa]/10 border border-[#cba6f7]/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#89b4fa] rounded-full"></div>
              <p className="text-xs text-[#89b4fa]">
                📝 Bản thảo đã được tải tự động. Bạn có thể tiếp tục chỉnh sửa hoặc xóa để bắt đầu mới.
              </p>
            </div>
          </div>
        )}

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
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#89b4fa] rounded-full"></div>
              Thông Tin Cơ Bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Tiêu đề truyện <span className="text-[#89b4fa]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="Nhập tiêu đề truyện..."
                  required
                />
                {getFieldError('title') && (
                  <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('title')}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Mô tả truyện <span className="text-[#89b4fa]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] placeholder-[#B0BEC5] resize-none transition-all duration-200"
                  placeholder="Nhập mô tả ngắn gọn về truyện..."
                  required
                />
                {getFieldError('description') && (
                  <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('description')}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] transition-all duration-200"
                >
                  <option value="draft">Bản thảo</option>
                  <option value="public">Xuất bản</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#fab387] rounded-full"></div>
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
              <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('category')}</p>
            )}
          </div>

          {/* Cover Image Section */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#E9967A] rounded-full"></div>
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
              <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('coverImage')}</p>
            )}
          </div>

          {/* Story Content Section */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#cba6f7] rounded-full"></div>
              Nội Dung Truyện
            </h2>
            <div className="border-2 border-[#cba6f7]/30 rounded-lg overflow-hidden">
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
              <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('content')}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#89b4fa] hover:bg-[#89b4fa]/90 text-[#11111b] px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
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
                        unoptimized
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
                onClick={() => router.push('/admin/stories')}
                className="flex-1 sm:flex-none bg-[#181825] hover:bg-[#181825]/80 text-[#a6adc8] px-6 py-3 rounded-lg font-medium transition-all duration-300 text-center text-sm border border-[#45475a] hover:border-[#585b70] hover:scale-105"
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
