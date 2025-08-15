# Hướng dẫn sử dụng chức năng Upload Ảnh

## Tổng quan
Chức năng upload ảnh cho phép người dùng tải lên ảnh bìa truyện thay vì dán link. Ảnh sẽ được upload lên ImgBB và link sẽ được lưu vào database.

## Cài đặt

### 1. Lấy API Key từ ImgBB
- Truy cập [ImgBB](https://imgbb.com/)
- Đăng ký tài khoản và lấy API key
- Thêm API key vào file `.env.local`:
```env
IMGBB_API_KEY=your_actual_api_key_here
```

### 2. Cài đặt dependencies
```bash
npm install
```

## Sử dụng

### 1. Import component
```tsx
import ImageUpload from '../component/ImageUpload';
```

### 2. Sử dụng trong form
```tsx
const [coverImage, setCoverImage] = useState('');

<ImageUpload
  currentImageUrl={coverImage}
  onImageChange={setCoverImage}
  className="mb-4"
/>
```

### 3. Gửi dữ liệu
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const storyData = {
    title,
    description,
    coverImage, // URL từ ImgBB
    // ... other fields
  };
  
  // Gửi lên backend
  await createStory(storyData);
};
```

## Tính năng

### ✅ Đã hoàn thành
- [x] Upload ảnh lên ImgBB
- [x] Preview ảnh trước khi upload
- [x] Validate file type (chỉ chấp nhận ảnh)
- [x] Validate file size (tối đa 32MB)
- [x] Loading state khi upload
- [x] Error handling
- [x] Xóa ảnh đã chọn
- [x] Drag & drop support

### 🔄 Đang phát triển
- [ ] Compress ảnh trước khi upload
- [ ] Multiple image upload
- [ ] Image cropping
- [ ] Progress bar

## API Endpoints

### POST /api/upload-image
Upload ảnh lên ImgBB

**Request:**
```typescript
FormData {
  image: File
}
```

**Response:**
```typescript
{
  url: string;           // Direct link to image
  display_url: string;   // Display URL
  delete_url: string;    // Delete URL
  id: string;            // Image ID
}
```

## Cấu trúc files

```
front-end/
├── src/
│   ├── component/
│   │   └── ImageUpload/
│   │       ├── ImageUpload.tsx    # Component chính
│   │       └── index.tsx          # Export
│   ├── services/
│   │   └── imageUploadService.ts  # Service upload
│   └── app/
│       └── api/
│           └── upload-image/
│               └── route.ts       # API route
└── .env.local                     # Environment variables
```

## Troubleshooting

### Lỗi thường gặp

1. **"Upload failed"**
   - Kiểm tra API key ImgBB
   - Kiểm tra kết nối internet
   - Kiểm tra file size (tối đa 32MB)

2. **"File must be an image"**
   - Chỉ chấp nhận file có extension: .jpg, .jpeg, .png, .gif
   - Kiểm tra MIME type của file

3. **"Image size must be less than 32MB"**
   - Nén ảnh trước khi upload
   - Sử dụng format ảnh nhẹ hơn

## Bảo mật

- API key ImgBB được lưu trong environment variables
- Validate file type và size trên cả frontend và backend
- Không lưu file trực tiếp lên server
- Sử dụng HTTPS cho tất cả API calls

## Tương lai

- [ ] Tích hợp với CDN khác (Cloudinary, AWS S3)
- [ ] Image optimization và compression
- [ ] Batch upload
- [ ] Image gallery management
