export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    size: number;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export const imageUploadService = {
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
    }
  },

  async uploadImageDirect(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Gọi trực tiếp ImgBB API (chỉ dùng cho development)
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result: ImgBBResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Upload failed');
      }

      return result.data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
    }
  }
};
