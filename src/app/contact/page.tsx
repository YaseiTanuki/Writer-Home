'use client';

import { useState } from 'react';
import { storyService } from '../../services/storyService';
import { CreateMessageRequest } from '../../types/story';

export default function ContactPage() {
  const [formData, setFormData] = useState<CreateMessageRequest>({
    name: '',
    email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await storyService.sendMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', content: '' });
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Liên hệ với tôi</h1>
          <p className="text-lg text-gray-600">
            Bạn có góp ý, câu hỏi hoặc muốn chia sẻ cảm nhận về truyện? Hãy để lại tin nhắn cho tôi!
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {submitStatus === 'success' && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Tin nhắn đã được gửi thành công!</p>
              <p className="text-sm mt-1">Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Không thể gửi tin nhắn</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên của bạn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung tin nhắn <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Viết tin nhắn của bạn ở đây..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin liên hệ khác</h3>
            <div className="text-gray-600 space-y-2">
              <p>• Bạn cũng có thể góp ý trực tiếp trong phần bình luận của từng chương</p>
              <p>• Tôi sẽ cố gắng phản hồi tất cả tin nhắn trong thời gian sớm nhất</p>
              <p>• Cảm ơn bạn đã dành thời gian đọc truyện của tôi!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
