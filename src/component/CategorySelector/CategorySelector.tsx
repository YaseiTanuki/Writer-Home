'use client';

import { useState, useEffect } from 'react';
import { storyService } from '../../services/storyService';
import { Category } from '../../types/story';
import { Plus, Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

export default function CategorySelector({ 
  selectedCategories, 
  onChange, 
  className = '' 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await storyService.getCategories();
      setCategories(response.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Không thể tải danh sách thể loại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onChange(newSelected);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Tên thể loại không được để trống');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      const response = await storyService.createCategory(newCategory);
      
      // Add new category to list and select it
      setCategories(prev => [...prev, response.category]);
      onChange([...selectedCategories, response.category._id]);
      
      // Reset form
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo thể loại');
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : categoryId;
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-gray-400">Đang tải thể loại...</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Thể loại *
        </label>
        
        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="mb-3 p-2 sm:p-3 bg-blue-900/20 border border-blue-700 rounded-md">
            <div className="text-xs sm:text-sm text-blue-400 mb-2">Thể loại đã chọn:</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {selectedCategories.map((catId) => {
                const category = categories.find(c => c._id === catId);
                return category ? (
                  <span
                    key={catId}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-900/20 text-blue-400 border border-blue-700"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(catId)}
                      className="ml-1 text-blue-400 hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Available Categories */}
        <div className="mb-3">
          <div className="text-xs sm:text-sm text-gray-300 mb-2">Chọn từ danh sách có sẵn:</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryToggle(category._id)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  selectedCategories.includes(category._id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                style={{
                  border: selectedCategories.includes(category._id) ? 'none' : `2px solid ${category.color}`
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Create New Category */}
        <div className="border-t border-gray-800 pt-3">
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {showCreateForm ? '✕ Hủy' : '+ Tạo thể loại mới'}
          </button>
          
          {showCreateForm && (
            <div className="mt-3 p-3 sm:p-4 bg-gray-800 rounded-md border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Tên thể loại *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Nhập tên thể loại..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Màu sắc
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-8 sm:h-10 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Mô tả ngắn gọn về thể loại..."
                />
              </div>
              
              {error && (
                <div className="mt-2 text-xs sm:text-sm text-red-400">
                  {error}
                </div>
              )}
              
              <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  onClick={handleCreateCategory}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Tạo Thể Loại
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCategory({ name: '', description: '', color: '#3B82F6' });
                    setError('');
                  }}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 border border-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
