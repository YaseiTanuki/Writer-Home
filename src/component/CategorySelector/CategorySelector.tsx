'use client';

import { useState, useEffect } from 'react';
import { storyService } from '../../services/storyService';
import { Category } from '../../types/story';

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
        <div className="text-sm text-gray-500">Đang tải thể loại...</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thể loại *
        </label>
        
        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => (
              <span
                key={categoryId}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {getCategoryName(categoryId)}
                <button
                  type="button"
                  onClick={() => handleCategoryToggle(categoryId)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {categories.map(category => (
            <label
              key={category._id}
              className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                selectedCategories.includes(category._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryToggle(category._id)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>

        {/* Create New Category Button */}
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showCreateForm ? 'Hủy tạo mới' : '+ Tạo thể loại mới'}
        </button>
      </div>

      {/* Create Category Form */}
      {showCreateForm && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tạo thể loại mới</h4>
          
          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên thể loại *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên thể loại"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mô tả (tùy chọn)
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả ngắn về thể loại"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Màu sắc
              </label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo thể loại'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCategories.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có thể loại nào được chọn
        </p>
      )}
    </div>
  );
}
