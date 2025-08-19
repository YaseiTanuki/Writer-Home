'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../../../contexts/AuthContext';
import { storyService } from '../../../../../services/storyService';
import { Story, UpdateStoryRequest } from '../../../../../types/story';
import TiptapEditor from '../../../../../component/TiptapEditor';
import CategorySelector from '../../../../../component/CategorySelector';
import Navigation from '../../../../../component/Navigation';
import ImageUpload from '../../../../../component/ImageUpload';
import { Edit3 } from 'lucide-react';

interface EditStoryFormData {
  title: string;
  description: string;
  content: string;
  category: string[];
  coverImage: string;
  status: 'draft' | 'public';
}

export default function EditStoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [error, setError] = useState('');
  const [story, setStory] = useState<Story | null>(null);
  const imageUploadRef = useRef<{ uploadImage: () => Promise<string>; hasNewFile: () => boolean }>(null);
  
  const [formData, setFormData] = useState<EditStoryFormData>({
    title: '',
    description: '',
    content: '',
    category: [],
    coverImage: '',
    status: 'draft'
  });

  // Auto-save draft functionality
  const saveDraft = useCallback(() => {
    if (formData.title || formData.description || formData.content) {
      const draft = {
        formData,
        storyId,
        timestamp: Date.now()
      };
      localStorage.setItem(`storyEditDraft_${storyId}`, JSON.stringify(draft));
    }
  }, [formData, storyId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`storyEditDraft_${storyId}`);
  }, [storyId]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`storyEditDraft_${storyId}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.storyId === storyId) {
          setFormData(draft.formData);
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, [storyId]); // Only depend on storyId, not formData

  // Auto-save draft functionality
  useEffect(() => {
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.description || formData.content) {
        const draft = {
          formData,
          storyId,
          timestamp: Date.now()
        };
        localStorage.setItem(`storyEditDraft_${storyId}`, JSON.stringify(draft));
      }
    }, 30000);

    // Save draft before page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title || formData.description || formData.content) {
        const draft = {
          formData,
          storyId,
          timestamp: Date.now()
        };
        localStorage.setItem(`storyEditDraft_${storyId}`, JSON.stringify(draft));
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save draft on component unmount
      if (formData.title || formData.description || formData.content) {
        const draft = {
          formData,
          storyId,
          timestamp: Date.now()
        };
        localStorage.setItem(`storyEditDraft_${storyId}`, JSON.stringify(draft));
      }
    };
  }, [formData, storyId]);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    router.push('/login');
    return null;
  }

  useEffect(() => {
    console.log('useEffect triggered:', { isAuthenticated, storyId });
    if (isAuthenticated && storyId) {
      loadStory();
    }
  }, [isAuthenticated, storyId]);

  const loadStory = async () => {
    try {
      setIsLoadingStory(true);
      console.log('Loading story with ID:', storyId);
      const response = await storyService.getStory(storyId);
      console.log('Story loaded:', response);
      setStory(response.story);
      setFormData({
        title: response.story.title,
        description: response.story.description,
        content: response.story.content || '',
        category: response.story.category,
        coverImage: response.story.coverImage,
        status: response.story.status
      });
      console.log('Form data set:', {
        title: response.story.title,
        description: response.story.description,
        content: response.story.content || '',
        category: response.story.category,
        coverImage: response.story.coverImage,
        status: response.story.status
      });
    } catch (err) {
      console.error('Failed to load story:', err);
      setError('Không thể tải thông tin truyện');
    } finally {
      setIsLoadingStory(false);
    }
  };

  if (isLoading || isLoadingStory) {
    console.log('Loading state:', { isLoading, isLoadingStory });
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 py-8">
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

  if (!story) {
    console.log('Story not found, showing error page');
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-400 text-xs">Không tìm thấy truyện</p>
                          <Link href="/admin" className="text-center text-pink-400 hover:text-pink-300 text-xs">
              Quay lại trang quản lý
            </Link>
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
    
    console.log('Form submitted:', formData);
    console.log('Story ID:', storyId);
    console.log('User authenticated:', isAuthenticated);
    console.log('User:', user);
    
    if (!formData.title || !formData.description || formData.category.length === 0 || !formData.content || formData.content.trim() === '') {
      console.log('Validation failed:', {
        title: !!formData.title,
        description: !!formData.description,
        category: formData.category.length,
        content: !!formData.content,
        contentTrim: formData.content?.trim()
      });
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Upload image first if there's a selected file
      let coverImageUrl = formData.coverImage;
      console.log('Current cover image:', coverImageUrl);
      console.log('Image upload ref:', imageUploadRef?.current);
      
      // Only upload if there's actually a new file selected
      if (imageUploadRef?.current?.uploadImage && imageUploadRef?.current?.hasNewFile?.()) {
        try {
          console.log('Uploading new image...');
          coverImageUrl = await imageUploadRef.current.uploadImage();
          console.log('Image uploaded successfully:', coverImageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Không thể upload ảnh. Vui lòng thử lại.');
          return;
        }
      } else {
        console.log('No new image selected, keeping current image');
      }
      
      // Convert form data to UpdateStoryRequest format
      const updateData: UpdateStoryRequest = {
        ...formData,
        coverImage: coverImageUrl
      };
      
      console.log('Updating story with data:', updateData);
      const result = await storyService.updateStory(storyId, updateData);
      console.log('Update result:', result);
      
      // Clear draft on successful update
      clearDraft();
      
      // Redirect to stories list on success
      router.push('/admin/stories');
    } catch (err) {
      console.error('Error updating story:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật truyện');
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
             <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight flex items-center justify-center sm:justify-start gap-2">
               <Edit3 size={22} className="text-blue-400" />
               Chỉnh Sửa Truyện
             </h1>
             <p className="text-xs sm:text-sm text-gray-300">
               Cập nhật thông tin truyện của bạn
             </p>
           </div>
         </div>

                   {/* Story Info Banner */}
          <div className="mb-6 p-3 sm:p-4 rounded-lg bg-[#00E5FF]/10 border-2 border-[#00E5FF]/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></div>
                <p className="text-xs sm:text-sm font-medium text-[#00E5FF]">
                  Đang chỉnh sửa truyện: <span className="text-[#FFFFFF] font-bold">{story.title}</span>
                </p>
              </div>
              {localStorage.getItem(`storyEditDraft_${storyId}`) && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-xs text-[#00E5FF] hover:text-[#00E5FF]/80 underline"
                >
                  Xóa bản thảo
                </button>
              )}
            </div>
          </div>

          {/* Draft Loaded Banner */}
          {localStorage.getItem(`storyEditDraft_${storyId}`) && (
            <div className="mb-4 p-3 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00E5FF] rounded-full"></div>
                <p className="text-xs text-[#00E5FF]">
                  📝 Bản thảo đã được tải tự động. Bạn có thể tiếp tục chỉnh sửa hoặc xóa để bắt đầu mới.
                </p>
              </div>
            </div>
          )}

         {error && (
           <div className="mb-4 p-3 rounded-lg bg-[#D2691E]/10 border-2 border-[#D2691E]/30 text-[#D2691E] text-xs backdrop-blur-sm">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#D2691E] rounded-full"></div>
               {error}
             </div>
           </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
           {/* Basic Information Section */}
           <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
             <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
               Thông Tin Cơ Bản
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Title */}
               <div className="md:col-span-2">
                 <label htmlFor="title" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                   <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                   Tiêu đề truyện <span className="text-[#00E5FF]">*</span>
                 </label>
                 <input
                   type="text"
                   id="title"
                   name="title"
                   value={formData.title}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
                   placeholder="Nhập tiêu đề truyện..."
                   required
                 />
               </div>

               {/* Description */}
               <div className="md:col-span-2">
                 <label htmlFor="description" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                   <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                   Mô tả truyện <span className="text-[#00E5FF]">*</span>
                 </label>
                 <textarea
                   id="description"
                   name="description"
                   value={formData.description}
                   onChange={handleInputChange}
                   rows={2}
                   className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200 resize-none"
                   placeholder="Nhập mô tả ngắn gọn về truyện..."
                   required
                 />
               </div>

               {/* Status */}
               <div>
                 <label htmlFor="status" className="block text-xs font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
                   <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
                   Trạng thái
                 </label>
                 <select
                   id="status"
                   name="status"
                   value={formData.status}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] text-xs bg-[#2A2A2A] text-[#FFFFFF] transition-all duration-200"
                 >
                   <option value="draft">Bản thảo</option>
                   <option value="public">Xuất bản</option>
                 </select>
               </div>
             </div>
           </div>

           {/* Categories Section */}
           <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
             <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#F4A460] rounded-full"></div>
               Thể Loại Truyện
             </h2>
             <CategorySelector
               selectedCategories={formData.category}
               onChange={(categories: string[]) => setFormData(prev => ({ ...prev, category: categories }))}
             />
           </div>

           {/* Cover Image Section */}
           <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
             <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#E9967A] rounded-full"></div>
               Ảnh Bìa Truyện
             </h2>
             <ImageUpload
               ref={imageUploadRef}
               currentImageUrl={formData.coverImage}
               onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, coverImage: imageUrl }))}
             />
           </div>

           {/* Story Content Section */}
           <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
             <h2 className="text-base font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#C97C4B] rounded-full"></div>
               Nội Dung Truyện
             </h2>
             <div className="border-2 border-[#00E5FF]/30 rounded-lg overflow-hidden">
               <TiptapEditor
                 content={formData.content}
                 onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                 placeholder="Viết nội dung truyện của bạn..."
               />
             </div>
           </div>

           {/* Action Buttons */}
           <div className="bg-[#1E1E1E] shadow-lg rounded-2xl p-4 sm:p-6 border-2 border-[#D2691E] shadow-[0_0_8px_#D2691E] backdrop-blur-sm">
             <div className="flex flex-col sm:flex-row gap-3">
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-1 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                 onClick={() => console.log('Submit button clicked')}
               >
                 {isSubmitting ? (
                   <>
                     <div className="relative w-4 h-4">
                       <Image
                         src="/reading.gif"
                         alt="Updating..."
                         width={16}
                         height={16}
                         className="rounded w-full h-full object-cover"
                       />
                     </div>
                     <span className="text-sm">Đang cập nhật...</span>
                   </>
                 ) : (
                   <>
                     <Edit3 size={16} />
                     <span className="text-sm">Cập Nhật Truyện</span>
                   </>
                 )}
               </button>
               
               <Link
                 href="/admin/stories"
                 className="flex-1 sm:flex-none bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 text-[#B0BEC5] px-6 py-3 rounded-lg font-medium transition-all duration-300 text-center text-sm border-2 border-[#D2691E] hover:border-[#C97C4B] hover:scale-105"
               >
                 Hủy Bỏ
               </Link>
             </div>
           </div>
         </form>
       </div>
    </div>
  );
}
