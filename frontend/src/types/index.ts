export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  parent_comment_id?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user: User;
  replies: Comment[];
  canEdit: boolean;
  canDelete: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  comment_id: string;
  is_read: boolean;
  created_at: string;
  user: User;
  comment: Comment;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateCommentDto {
  content: string;
  parent_comment_id?: string;
}

export interface UpdateCommentDto {
  content: string;
}
