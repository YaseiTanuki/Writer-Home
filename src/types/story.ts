export interface Story {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string[];
  coverImage: string;
  status: 'draft' | 'public';
  author?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Chapter {
  _id: string;
  storyId: string | { _id: string; title: string };
  title: string;
  content: string;
  chapterNumber: number;
  status: 'draft' | 'public';
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  content: string;
  reply?: string;
  guestName?: string;
  guestPicture?: string;
  guestEmail?: string;
  createdAt: string;
  
  // Guest replies from other guests (nested comment system)
  guestReplies?: Array<{
    _id: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPicture?: string;
    content: string;
    createdAt: string;
    parentReplyId?: string;
    replies?: Array<{
      _id: string;
      guestId: string;
      guestName: string;
      guestEmail: string;
      guestPicture?: string;
      content: string;
      createdAt: string;
    }>;
  }>;
}

export interface CreateStoryRequest {
  title: string;
  description: string;
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
  status?: 'draft' | 'public';
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  chapterNumber?: number;
  status?: 'draft' | 'public';
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  content: string;
  guestToken?: string;
}

export interface CreateGuestReplyRequest {
  messageId: string;
  content: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPicture?: string;
  parentReplyId?: string; // ID của reply gốc nếu đây là reply của reply
}
