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
    color: '#ec4899'
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
      setNewCategory({ name: '', description: '', color: '#ec4899' });
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
        <label className="block text-sm font-medium text-[#B0BEC5] mb-2 flex items-center gap-2">
          <div className="w-1 h-1 bg-[#00E5FF] rounded-full"></div>
          Thể loại <span className="text-[#00E5FF]">*</span> ({selectedCategories.length} đã chọn)
        </label>
        
        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="mb-3 p-3 bg-[#00E5FF]/10 border-2 border-[#00E5FF]/30 rounded-lg">
            <div className="text-xs sm:text-sm text-[#00E5FF] mb-2">
              Thể loại đã chọn:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const category = categories.find(c => c._id === catId);
                return category ? (
                  <span
                    key={catId}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border-2 border-[#00E5FF]/30"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(catId)}
                      className="ml-2 text-[#00E5FF] hover:text-[#00E5FF]/80 hover:bg-[#00E5FF]/20 rounded-full w-5 h-5 flex items-center justify-center transition-all duration-200"
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
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0BEC5]" />
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-[#00E5FF]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0BEC5] hover:text-[#00E5FF] transition-all duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Available Categories */}
        <div className="mb-3">
          <div className="text-xs sm:text-sm text-[#B0BEC5] mb-2">
            Chọn từ danh sách có sẵn:
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-20 overflow-y-auto p-2 border-2 border-[#00E5FF]/30 rounded-lg bg-[#2A2A2A]">
            {filteredCategories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryToggle(category._id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-between ${
                  selectedCategories.includes(category._id)
                    ? 'bg-[#00E5FF] text-[#1E1E1E] shadow-lg scale-105'
                    : 'bg-[#2A2A2A] text-[#B0BEC5] hover:bg-[#2A2A2A]/80 hover:scale-105'
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
            <div className="text-center py-4 text-[#B0BEC5] text-sm">
              {searchTerm ? 'Không tìm thấy thể loại nào phù hợp' : 'Không có thể loại nào'}
            </div>
          )}
        </div>

        {/* Create New Category */}
        <div className="border-t-2 border-[#00E5FF]/30 pt-2 sm:pt-3">
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-xs sm:text-sm text-[#00E5FF] hover:text-[#00E5FF]/80 font-medium transition-all duration-200"
          >
            {showCreateForm ? '✕ Hủy' : '+ Tạo thể loại mới'}
          </button>
          
          {showCreateForm && (
            <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-[#2A2A2A] rounded-lg border-2 border-[#00E5FF]/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#B0BEC5] mb-1.5 sm:mb-2">
                    Tên thể loại <span className="text-[#00E5FF]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#00E5FF]/30 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
                    placeholder="Nhập tên thể loại..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#B0BEC5] mb-1.5 sm:mb-2">
                    Màu sắc
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-8 sm:h-10 border-2 border-[#00E5FF]/30 rounded-lg cursor-pointer bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium text-[#B0BEC5] mb-1.5 sm:mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#00E5FF]/30 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] bg-[#2A2A2A] text-[#FFFFFF] placeholder-[#B0BEC5] transition-all duration-200"
                  placeholder="Mô tả ngắn gọn về thể loại..."
                />
              </div>
              
              {error && (
                <div className="mt-2 text-xs sm:text-sm text-[#D2691E] bg-[#D2691E]/10 border-2 border-[#D2691E]/30 rounded-lg p-2">
                  {error}
                </div>
              )}
              
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreating}
                  className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#1E1E1E] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg hover:scale-105"
                >
                  {isCreating ? (
                    <>
                      <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                        <Image
                          src="/reading.gif"
                          alt="Creating..."
                          width={16}
                          height={16}
                          className="rounded w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs sm:text-sm">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Tạo Thể Loại</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCategory({ name: '', description: '', color: '#ec4899' });
                    setError('');
                  }}
                  className="flex-1 sm:flex-none bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 text-[#B0BEC5] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border-2 border-[#D2691E] hover:border-[#C97C4B] hover:scale-105"
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
