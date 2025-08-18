'use client';

import { useState, useEffect, useRef } from 'react';
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
      
      // Redirect to admin dashboard on success
      router.push('/admin');
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
         <div className="mb-6 p-3 sm:p-4 rounded-md bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 backdrop-blur-sm">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
             <p className="text-xs sm:text-sm font-medium text-blue-200">
               Đang chỉnh sửa truyện: <span className="text-white font-bold">{story.title}</span>
             </p>
           </div>
         </div>

         {error && (
           <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-700/50 text-red-300 text-xs">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
               {error}
             </div>
           </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
           {/* Basic Information Section */}
           <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
             <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
               <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
               Thông Tin Cơ Bản
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Title */}
               <div className="md:col-span-2">
                 <label htmlFor="title" className="block text-xs font-medium text-gray-200 mb-1.5">
                   Tiêu đề truyện *
                 </label>
                 <input
                   type="text"
                   id="title"
                   name="title"
                   value={formData.title}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400 transition-all duration-200"
                   placeholder="Nhập tiêu đề truyện..."
                   required
                 />
               </div>

               {/* Description */}
               <div className="md:col-span-2">
                 <label htmlFor="description" className="block text-xs font-medium text-gray-200 mb-1.5">
                   Mô tả truyện *
                 </label>
                 <textarea
                   id="description"
                   name="description"
                   value={formData.description}
                   onChange={handleInputChange}
                   rows={2}
                   className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white placeholder-gray-400 transition-all duration-200 resize-none"
                   placeholder="Nhập mô tả ngắn gọn về truyện..."
                   required
                 />
               </div>

               {/* Status */}
               <div>
                 <label htmlFor="status" className="block text-xs font-medium text-gray-200 mb-1.5">
                   Trạng thái
                 </label>
                 <select
                   id="status"
                   name="status"
                   value={formData.status}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-gray-800 text-white transition-all duration-200"
                 >
                   <option value="draft">Bản thảo</option>
                   <option value="public">Xuất bản</option>
                 </select>
               </div>
             </div>
           </div>

           {/* Categories Section */}
           <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
             <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
               <div className="w-1.5 h-3 bg-green-500 rounded-full"></div>
               Thể Loại Truyện
             </h2>
             <CategorySelector
               selectedCategories={formData.category}
               onChange={(categories: string[]) => setFormData(prev => ({ ...prev, category: categories }))}
             />
           </div>

           {/* Cover Image Section */}
           <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
             <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
               <div className="w-1.5 h-3 bg-purple-500 rounded-full"></div>
               Ảnh Bìa Truyện
             </h2>
             <ImageUpload
               ref={imageUploadRef}
               currentImageUrl={formData.coverImage}
               onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, coverImage: imageUrl }))}
             />
           </div>

           {/* Story Content Section */}
           <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
             <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
               <div className="w-1.5 h-3 bg-yellow-500 rounded-full"></div>
               Nội Dung Truyện
             </h2>
             <div className="border border-gray-700 rounded-md overflow-hidden">
               <TiptapEditor
                 content={formData.content}
                 onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                 placeholder="Viết nội dung truyện của bạn..."
               />
             </div>
           </div>

           {/* Action Buttons */}
           <div className="bg-gray-900/50 rounded-md p-4 border border-gray-800">
             <div className="flex flex-col sm:flex-row gap-3">
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-102"
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
                 href="/admin"
                 className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-3 rounded-md font-medium transition-all duration-200 text-center text-sm border border-gray-600 hover:border-gray-500 transform hover:scale-102"
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
