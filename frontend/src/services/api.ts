import axios from 'axios';
import { AuthResponse, Comment, Notification, CreateCommentDto, UpdateCommentDto } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (username: string, email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/register', { username, email, password }).then(res => res.data),
  
  login: (username: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { username, password }).then(res => res.data),
};

export const commentsApi = {
  getAll: (): Promise<Comment[]> =>
    api.get('/comments').then(res => res.data),
  
  getOne: (id: string): Promise<Comment> =>
    api.get(`/comments/${id}`).then(res => res.data),
  
  create: (data: CreateCommentDto): Promise<Comment> =>
    api.post('/comments', data).then(res => res.data),
  
  update: (id: string, data: UpdateCommentDto): Promise<Comment> =>
    api.patch(`/comments/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/comments/${id}`).then(res => res.data),
  
  restore: (id: string): Promise<Comment> =>
    api.post(`/comments/${id}/restore`).then(res => res.data),
};

export const notificationsApi = {
  getAll: (): Promise<Notification[]> =>
    api.get('/notifications').then(res => res.data),
  
  markAsRead: (id: string): Promise<{ message: string }> =>
    api.patch(`/notifications/${id}/read`).then(res => res.data),
  
  markAllAsRead: (): Promise<{ message: string }> =>
    api.patch('/notifications/read-all').then(res => res.data),
};

export default api;
