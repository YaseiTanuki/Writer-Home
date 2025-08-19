'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { storyService } from '../../../services/storyService';
import { CreateChapterRequest, Story } from '../../../types/story';
import Navigation from '../../../component/Navigation';
import { Sparkles, BookOpen, Home, Plus, ArrowLeft } from 'lucide-react';

export default function NewChapterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CreateChapterRequest>({
    title: '',
    storyId: '',
    content: '',
    chapterNumber: 1
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    }
  }, [isAuthenticated]);

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
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        content: '' // Will be filled in the next step
      };
      
      // Store in localStorage for the next step
      localStorage.setItem('tempChapter', JSON.stringify(tempChapter));
      
      // Navigate to content writing page
      router.push(`/admin/new-chapter/content`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-16 md:pt-24 lg:pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <div className="relative mb-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  <Sparkles size={20} className="text-pink-400 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  Tạo Chương Mới
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">
                  Thêm chương mới vào truyện
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
              Thông Tin Chương
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  Tiêu đề chương <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="Nhập tiêu đề chương..."
                  required
                />
                {getFieldError('title') && (
                  <p className="text-[#D2691E] text-xs mt-1">{getFieldError('title')}</p>
                )}
              </div>

              {/* Chapter Number */}
              <div>
                <label htmlFor="chapterNumber" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                  Số chương <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="number"
                  id="chapterNumber"
                  name="chapterNumber"
                  value={formData.chapterNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('chapterNumber')}
                  min="1"
                  className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="1"
                  required
                />
                {getFieldError('chapterNumber') && (
                  <p className="text-[#D2691E] text-xs mt-1">{getFieldError('chapterNumber')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Story Selection Section */}
          <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#F4A460] rounded-full"></div>
              Chọn Truyện
            </h2>
            <div>
              <label htmlFor="storyId" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                Truyện <span className="text-[#00E5FF]">*</span>
              </label>
              <select
                id="storyId"
                name="storyId"
                value={formData.storyId}
                onChange={handleStoryChange}
                onBlur={() => handleBlur('storyId')}
                className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] transition-all duration-200"
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
                <div className="mt-2 p-2 bg-[#F4A460]/10 border-2 border-[#F4A460]/30 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#F4A460] rounded-full"></div>
                    <p className="text-xs text-[#F4A460]">
                      Chưa có truyện nào. Vui lòng <Link href="/admin/new-story" className="text-[#00E5FF] hover:underline">tạo truyện trước</Link>.
                    </p>
                  </div>
                </div>
              )}
              {getFieldError('storyId') && (
                <p className="text-[#D2691E] text-xs mt-1">{getFieldError('storyId')}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg hover:scale-105"
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
                className="flex-1 sm:flex-none bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 text-[#B0BEC5] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-center text-sm sm:text-base border-2 border-[#D2691E] hover:border-[#C97C4B] hover:scale-105"
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
