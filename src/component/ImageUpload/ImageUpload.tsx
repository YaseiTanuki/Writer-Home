'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { imageUploadService } from '../../services/imageUploadService';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

const ImageUpload = forwardRef<{ uploadImage: () => Promise<string>; hasNewFile: () => boolean }, ImageUploadProps>(({ currentImageUrl, onImageChange, className = '' }, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // User cancelled file selection, keep current image
      setSelectedFile(null);
      setUploadError('');
      // Reset preview to current image if no new file selected
      if (currentImageUrl) {
        setPreviewUrl(currentImageUrl);
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file ảnh hợp lệ');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 32MB)
    if (file.size > 32 * 1024 * 1024) {
      setUploadError('Kích thước ảnh không được vượt quá 32MB');
      setSelectedFile(null);
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Function to upload image (called by parent component)
  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error('Không có ảnh nào được chọn');
    }

    try {
      setIsUploading(true);
      setUploadError('');

      // Upload to ImgBB
      const imageUrl = await imageUploadService.uploadImage(selectedFile);
      
      // Clear selected file after successful upload
      setSelectedFile(null);
      
      return imageUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Expose uploadImage function to parent via ref
  useImperativeHandle(ref, () => ({
    uploadImage,
    hasNewFile: () => selectedFile !== null
  }), [selectedFile]);

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-medium text-gray-300">
        Ảnh bìa truyện
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          previewUrl 
            ? 'border-blue-500 bg-blue-50/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        {previewUrl ? (
          // Image Preview
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />

            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {selectedFile ? 'Ảnh mới' : 'Ảnh hiện tại'}
            </div>
            {selectedFile && currentImageUrl && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(currentImageUrl);
                  setUploadError('');
                }}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                Giữ ảnh cũ
              </button>
            )}
          </div>
        ) : (
          // Upload Area
          <div className="text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              {isUploading ? (
                <Loader2 size={32} className="animate-spin text-blue-400" />
              ) : (
                <ImageIcon size={32} className="text-gray-400" />
              )}
              <div className="text-sm text-gray-300">
                {isUploading ? (
                  'Đang upload ảnh...'
                ) : (
                  <>
                    <span className="font-medium text-blue-400">Click để chọn ảnh</span>
                    <span className="text-gray-400"> hoặc kéo thả ảnh vào đây</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF tối đa 32MB
              </p>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>

      {uploadError && (
        <div className="text-red-400 text-xs bg-red-900/20 border border-red-700 px-3 py-2 rounded">
          {uploadError}
        </div>
      )}

      {previewUrl && (
        <div className="text-xs text-gray-400 text-center">
          Ảnh đã được upload thành công
        </div>
      )}
    </div>
  );
});

export default ImageUpload;
