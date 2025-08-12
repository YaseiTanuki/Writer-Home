export interface Story {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string[];
  coverImage: string;
  status: 'draft' | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  _id: string;
  storyId: string;
  title: string;
  content: string;
  chapterNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface CreateStoryRequest {
  title: string;
  description: string;
  content: string;
  category: string[];
  coverImage: string;
  status?: 'draft' | 'public';
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  content?: string;
  category?: string[];
  coverImage?: string;
  status?: 'draft' | 'public';
}

export interface CreateChapterRequest {
  storyId: string;
  title: string;
  content: string;
  chapterNumber: number;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  chapterNumber?: number;
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  content: string;
}
