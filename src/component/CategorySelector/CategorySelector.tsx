'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { storyService } from '../../services/storyService';
import { Category } from '../../types/story';
import { Plus, X, Check, Search, Filter } from 'lucide-react';

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
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);



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
          Thể loại * ({selectedCategories.length} đã chọn)
        </label>
        
        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="mb-3 p-3 bg-blue-900/20 border border-blue-700 rounded-md">
            <div className="text-xs sm:text-sm text-blue-400 mb-2">
              Thể loại đã chọn:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const category = categories.find(c => c._id === catId);
                return category ? (
                  <span
                    key={catId}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-900/20 text-blue-400 border border-blue-700"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(catId)}
                      className="ml-2 text-blue-400 hover:text-blue-300 hover:bg-blue-800 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}



        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Available Categories */}
        <div className="mb-3">
          <div className="text-xs sm:text-sm text-gray-300 mb-2">
            Chọn từ danh sách có sẵn:
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-20 overflow-y-auto p-2 border border-gray-700 rounded-md bg-gray-900/50">
            {filteredCategories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryToggle(category._id)}
                className={`p-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                  selectedCategories.includes(category._id)
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-102'
                }`}
                style={{
                  border: selectedCategories.includes(category._id) ? 'none' : `2px solid ${category.color}`
                }}
              >
                <span className="truncate">{category.name}</span>
                {selectedCategories.includes(category._id) && (
                  <Check size={12} className="ml-1 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              {searchTerm ? 'Không tìm thấy thể loại nào phù hợp' : 'Không có thể loại nào'}
            </div>
          )}
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
            <div className="mt-3 p-4 bg-gray-800 rounded-md border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên thể loại *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Nhập tên thể loại..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Màu sắc
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-600 rounded-md cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Mô tả ngắn gọn về thể loại..."
                />
              </div>
              
              {error && (
                <div className="mt-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="relative w-4 h-4">
                        <Image
                          src="/reading.gif"
                          alt="Creating..."
                          width={16}
                          height={16}
                          className="rounded w-full h-full object-cover"
                        />
                      </div>
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
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-gray-600"
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
