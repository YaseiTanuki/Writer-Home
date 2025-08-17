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
  CreateMessageRequest,
  CreateGuestReplyRequest
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
    const response = await fetch('http://localhost:8111/api/categories', {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  },

  // Create a new category (requires authentication)
  async createCategory(categoryData: CreateCategoryRequest): Promise<{ message: string; category: Category }> {
    const response = await fetch('http://localhost:8111/api/categories', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  },

  // Update a category (requires authentication)
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{ message: string; category: Category }> {
    const response = await fetch(`http://localhost:8111/api/categories/${id}`, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    return response.json();
  },

  // Delete a category (requires authentication)
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await fetch(`http://localhost:8111/api/categories/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }

    return response.json();
  },

  // Get all messages
  async getMessages(): Promise<{ messages: Message[]; count: number }> {
    const response = await fetch('http://localhost:8111/api/messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch messages');
    }

    return response.json();
  },

  // Send a new message
  async sendMessage(messageData: CreateMessageRequest): Promise<{ message: string; data: Message }> {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Reply to a message (admin only)
  async replyMessage(messageId: string, reply: string): Promise<{ message: string; data: Message }> {
    const response = await fetch('http://localhost:8111/api/messages', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId, reply }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reply to message');
    }

    return response.json();
  },

  // Get all users (for admin dashboard)
  async getUsers(): Promise<{ users: any[]; count: number }> {
    const response = await fetch('http://localhost:8111/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  },

  // Delete a user and all related messages
  async deleteUser(userId: string): Promise<{ message: string; deletedMessages: number; deletedUser: any }> {
    const response = await fetch(`http://localhost:8111/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  },

  // Add a guest reply to a message
  async addGuestReply(replyData: CreateGuestReplyRequest): Promise<{ message: string; data: Message }> {
    const response = await fetch('http://localhost:8111/api/messages/guest-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add guest reply');
    }

    return response.json();
  },

  // Add a nested guest reply (reply to another reply)
  async addNestedGuestReply(replyData: CreateGuestReplyRequest): Promise<{ message: string; data: Message }> {
    // This is the same as addGuestReply but with parentReplyId set
    return this.addGuestReply(replyData);
  },

  // Delete a guest reply (admin only)
  async deleteGuestReply(messageId: string, replyIndex: number): Promise<{ message: string; data: Message }> {
    const response = await fetch(`http://localhost:8111/api/messages/${messageId}/guest-reply/${replyIndex}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete guest reply');
    }

    return response.json();
  },

  // Delete a nested guest reply (admin only)
  async deleteNestedGuestReply(messageId: string, replyIndex: number, nestedReplyIndex: number): Promise<{ message: string; data: Message }> {
    const response = await fetch(`http://localhost:8111/api/messages/${messageId}/guest-reply/${replyIndex}/nested/${nestedReplyIndex}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete nested guest reply');
    }

    return response.json();
  },
};
