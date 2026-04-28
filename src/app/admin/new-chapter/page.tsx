'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../types/story';
import { Sparkles, Plus } from 'lucide-react';

export default function NewChapterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CreateChapterRequest>({
    title: '',
    storyId: '',
    content: '',
    chapterNumber: 1,
    status: 'draft'
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // Auto-save draft functionality
  const clearDraft = useCallback(() => {
    localStorage.removeItem('chapterDraft');
  }, []);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('chapterDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-save draft functionality
  useEffect(() => {
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.storyId) {
        const draft = {
          formData,
          timestamp: Date.now()
        };
        localStorage.setItem('chapterDraft', JSON.stringify(draft));
      }
    }, 30000);

    // Save draft before page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title || formData.storyId) {
        const draft = {
          formData,
          timestamp: Date.now()
        };
        localStorage.setItem('chapterDraft', JSON.stringify(draft));
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save draft on component unmount
      if (formData.title || formData.storyId) {
        const draft = {
          formData,
          timestamp: Date.now()
        };
        localStorage.setItem('chapterDraft', JSON.stringify(draft));
      }
    };
  }, [formData]);

  // Load stories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated]);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  const loadStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await storyService.getStories();
      setStories(response.stories);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Auto-calculate chapter number when story is selected
  const handleStoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storyId = e.target.value;
    setFormData(prev => ({ ...prev, storyId }));
    setTouched(prev => ({ ...prev, storyId: true }));
    
    if (storyId) {
      try {
        // Get chapters for the selected story to calculate next chapter number
        const chaptersResponse = await storyService.getChapters(storyId);
        const nextChapterNumber = chaptersResponse.chapters.length > 0 
          ? Math.max(...chaptersResponse.chapters.map(c => c.chapterNumber)) + 1
          : 1;
        
        setFormData(prev => ({ ...prev, chapterNumber: nextChapterNumber }));
      } catch (err) {
        console.error('Failed to load chapters:', err);
        // Fallback to chapter 1 if there's an error
        setFormData(prev => ({ ...prev, chapterNumber: 1 }));
      }
    }
  };

  if (isLoading || isLoadingStories) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
          <div className="lg:pt-32 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
              <Image
                src="/reading.gif"
                alt="Loading..."
                width={80}
                height={80}
                className="rounded-lg w-full h-full object-cover"
                unoptimized
              />
            </div>
            <p className="mt-4 text-[#a6adc8]">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
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
      case 'storyId':
        return !formData.storyId ? 'Vui lòng chọn truyện' : null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
    setTouched({
      title: true,
      storyId: true
    });
    
    if (!formData.title || !formData.storyId) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Create a temporary chapter with basic info
      const tempChapter = {
        storyId: formData.storyId,
        title: formData.title,
        chapterNumber: formData.chapterNumber,
        status: formData.status,
        content: '' // Will be filled in the next step
      };
      
      // Store in localStorage for the next step
      localStorage.setItem('tempChapter', JSON.stringify(tempChapter));
      
      // Clear draft on successful creation
      clearDraft();
      
      // Navigate to content writing page
      router.push(`/admin/new-chapter/content`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      
      {/* Main Content */}
      <div className="lg:pt-32 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <div className="relative mb-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#cdd6f4] mb-2 leading-tight flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  <Sparkles size={20} className="text-pink-400 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  Tạo Chương Mới
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <p className="text-xs sm:text-sm md:text-base text-[#a6adc8]">
                  Thêm chương mới vào truyện
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Loaded Banner */}
        {localStorage.getItem('chapterDraft') && (
          <div className="mb-4 p-3 rounded-md bg-[#89b4fa]/10 border border-[#cba6f7]/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#89b4fa] rounded-full"></div>
                <p className="text-xs text-[#89b4fa]">
                  📝 Bản thảo đã được tải tự động. Bạn có thể tiếp tục chỉnh sửa hoặc xóa để bắt đầu mới.
                </p>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="text-xs text-[#89b4fa] hover:text-[#89b4fa]/80 underline"
              >
                Xóa bản thảo
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Story Selection Section */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#fab387] rounded-full"></div>
              Chọn Truyện
            </h2>
            <div>
              <label htmlFor="storyId" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                Truyện <span className="text-[#89b4fa]">*</span>
              </label>
              <select
                id="storyId"
                name="storyId"
                value={formData.storyId}
                onChange={handleStoryChange}
                onBlur={() => handleBlur('storyId')}
                className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] transition-all duration-200"
                required
              >
                <option value="">-- Chọn truyện --</option>
                {stories.map((story) => (
                  <option key={story._id} value={story._id}>
                    {story.title}
                  </option>
                ))}
              </select>
              {stories.length === 0 && (
                <div className="mt-2 p-2 bg-[#fab387]/10 border-2 border-[#fab387]/30 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#fab387] rounded-full"></div>
                    <p className="text-xs text-[#fab387]">
                      Chưa có truyện nào. Vui lòng <Link href="/admin/new-story" className="text-[#89b4fa] hover:underline">tạo truyện trước</Link>.
                    </p>
                  </div>
                </div>
              )}
              {getFieldError('storyId') && (
                <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('storyId')}</p>
              )}
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#cdd6f4] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#89b4fa] rounded-full"></div>
              Thông Tin Chương
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Tiêu đề chương <span className="text-[#89b4fa]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="Nhập tiêu đề chương..."
                  required
                />
                {getFieldError('title') && (
                  <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('title')}</p>
                )}
              </div>

              {/* Chapter Number */}
              <div>
                <label htmlFor="chapterNumber" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Số chương <span className="text-[#89b4fa]">*</span>
                </label>
                <input
                  type="number"
                  id="chapterNumber"
                  name="chapterNumber"
                  value={formData.chapterNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('chapterNumber')}
                  min="1"
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="1"
                  required
                />
                {getFieldError('chapterNumber') && (
                  <p className="text-[#cba6f7] text-xs mt-1">{getFieldError('chapterNumber')}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-[#a6adc8] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#89b4fa] rounded-full"></div>
                  Trạng thái <span className="text-[#89b4fa]">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('status')}
                  className="w-full px-3 py-2 border-2 border-[#cba6f7]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] text-xs bg-[#181825] text-[#cdd6f4] transition-all duration-200"
                  required
                >
                  <option value="draft">Bản nháp</option>
                  <option value="public">Công khai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#313244] shadow-lg rounded-2xl p-4 sm:p-6 border border-[#45475a] backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#89b4fa] hover:bg-[#89b4fa]/90 text-[#11111b] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                      <Image
                        src="/reading.gif"
                        alt="Creating..."
                        width={20}
                        height={20}
                        className="rounded w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-sm sm:text-base">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Tạo Chương</span>
                  </>
                )}
              </button>
              <Link
                href="/admin"
                className="flex-1 sm:flex-none bg-[#181825] hover:bg-[#181825]/80 text-[#a6adc8] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-center text-sm sm:text-base border border-[#45475a] hover:border-[#585b70] hover:scale-105"
              >
                Hủy
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
