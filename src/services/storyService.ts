import { apiRequest } from '../lib/auth';
import { 
  Story, 
  Chapter, 
  Message, 
  Category,
  CreateStoryRequest, 
  UpdateStoryRequest, 
  CreateChapterRequest, 
  UpdateChapterRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMessageRequest 
} from '../types/story';

export const storyService = {
  // Get all stories with optional filters
  async getStories(params?: { 
    status?: string; 
    category?: string; 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<{ stories: Story[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/stories?${queryString}` : '/api/stories';
    
    return apiRequest(endpoint);
  },

  // Get a single story by ID
  async getStory(id: string): Promise<{ story: Story }> {
    return apiRequest(`/api/stories/${id}`);
  },

  // Create a new story (requires authentication)
  async createStory(storyData: CreateStoryRequest): Promise<{ message: string; story: Story }> {
    return apiRequest('/api/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  },

  // Update a story (requires authentication)
  async updateStory(id: string, storyData: UpdateStoryRequest): Promise<{ message: string; story: Story }> {
    return apiRequest(`/api/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storyData),
    });
  },

  // Delete a story (requires authentication)
  async deleteStory(id: string): Promise<{ message: string }> {
    return apiRequest(`/api/stories/${id}`, {
      method: 'DELETE',
    });
  },

  // Get chapters for a story
  async getChapters(storyId: string): Promise<{ chapters: Chapter[]; count: number }> {
    return apiRequest(`/api/chapters?storyId=${storyId}`);
  },

  // Get all chapters (for admin dashboard)
  async getAllChapters(): Promise<{ chapters: Chapter[]; count: number }> {
    return apiRequest('/api/chapters');
  },

  // Get a single chapter by ID
  async getChapter(id: string): Promise<{ chapter: Chapter }> {
    return apiRequest(`/api/chapters/${id}`);
  },

  // Create a new chapter (requires authentication)
  async createChapter(chapterData: CreateChapterRequest): Promise<{ message: string; chapter: Chapter }> {
    return apiRequest('/api/chapters', {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  },

  // Update a chapter (requires authentication)
  async updateChapter(id: string, chapterData: UpdateChapterRequest): Promise<{ message: string; chapter: Chapter }> {
    return apiRequest(`/api/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chapterData),
    });
  },

  // Delete a chapter (requires authentication)
  async deleteChapter(id: string): Promise<{ message: string }> {
    return apiRequest(`/api/chapters/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all categories
  async getCategories(): Promise<{ categories: Category[]; count: number }> {
    return apiRequest('/api/categories');
  },

  // Create a new category (requires authentication)
  async createCategory(categoryData: CreateCategoryRequest): Promise<{ message: string; category: Category }> {
    return apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Update a category (requires authentication)
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{ message: string; category: Category }> {
    return apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete a category (requires authentication)
  async deleteCategory(id: string): Promise<{ message: string }> {
    return apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all messages
  async getMessages(): Promise<{ messages: Message[]; count: number }> {
    return apiRequest('/api/messages');
  },

  // Send a new message
  async sendMessage(messageData: CreateMessageRequest): Promise<{ message: string; data: Message }> {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },
};
