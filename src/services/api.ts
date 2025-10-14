import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wave-i7av.onrender.com/api'
  : 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API response interface
interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: any[];
  code?: string;
}

// Auth API
export const authAPI = {
  login: (login: string, password: string) =>
    api.post<ApiResponse<{ user: any; token: string; refreshToken: string }>>('/auth/login', {
      login,
      password,
    }),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    api.post<ApiResponse<{ user: any; token: string; refreshToken: string }>>('/auth/register', userData),

  getCurrentUser: () =>
    api.get<ApiResponse<{ user: any }>>('/auth/me'),

  logout: () =>
    api.post<ApiResponse>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    }),

  updateUser: (userId: string, userData: any) =>
    api.put<ApiResponse<{ user: any }>>(`/users/${userId}`, userData),
};

// Users API
export const usersAPI = {
  getPublicUsers: () =>
    api.get<ApiResponse<{ users: any[] }>>('/users/public'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get<ApiResponse<{ users: any[]; pagination: any }>>('/users', { params }),

  getUser: (userId: string) =>
    api.get<ApiResponse<{ user: any }>>(`/users/${userId}`),

  updateUser: (userId: string, userData: any) =>
    api.put<ApiResponse<{ user: any }>>(`/users/${userId}`, userData),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse>(`/users/${userId}`),

  activateUser: (userId: string, isActive: boolean) =>
    api.put<ApiResponse<{ user: any }>>(`/users/${userId}/activate`, { isActive }),
};

// Blog API
export const blogAPI = {
  getBlogs: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) =>
    api.get<{ message: string; blogs: any[]; pagination: any }>('/blog', { params }),

  getBlog: (slug: string) =>
    api.get<{ message: string; blog: any }>(`/blog/${slug}`),

  getDrafts: () =>
    api.get<{ message: string; blogs: any[] }>('/blog/draft'),

  createBlog: (blogData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags?: string[];
    status?: 'draft' | 'published';
    featuredImage?: string;
  }) =>
    api.post<{ message: string; blog: any }>('/blog', blogData),

  updateBlog: (blogId: string, blogData: any) =>
    api.put<{ message: string; blog: any }>(`/blog/${blogId}`, blogData),

  deleteBlog: (blogId: string) =>
    api.delete<{ message: string }>(`/blog/${blogId}`),

  likeBlog: (blogId: string) =>
    api.post<{ message: string; likeCount: number }>(`/blog/${blogId}/like`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ message: string; imageUrl: string }>('/blog/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ApiResponse<{ events: any[]; pagination: any }>>('/calendar', { params }),

  getEvent: (eventId: string) =>
    api.get<ApiResponse<{ event: any }>>(`/calendar/${eventId}`),

  getMyEvents: () =>
    api.get<ApiResponse<{ organized: any[]; attending: any[] }>>('/calendar/my-events'),

  createEvent: (eventData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    category?: string;
    location?: string;
    maxAttendees?: number;
    registrationRequired?: boolean;
  }) =>
    api.post<ApiResponse<{ event: any }>>('/calendar', eventData),

  updateEvent: (eventId: string, eventData: any) =>
    api.put<ApiResponse<{ event: any }>>(`/calendar/${eventId}`, eventData),

  deleteEvent: (eventId: string) =>
    api.delete<ApiResponse>(`/calendar/${eventId}`),

  registerForEvent: (eventId: string) =>
    api.post<ApiResponse<{ attendeeCount: number }>>(`/calendar/${eventId}/register`),

  unregisterFromEvent: (eventId: string) =>
    api.delete<ApiResponse<{ attendeeCount: number }>>(`/calendar/${eventId}/register`),
};

// Appointment API
export const appointmentAPI = {
  // Public endpoints
  getPublicAppointments: (userId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ appointments: any[] }>>(`/appointments/public/${userId}`, { params }),

  createPublicAppointment: (userId: string, appointmentData: {
    date: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientSurname: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  }) =>
    api.post<ApiResponse<{ appointment: any }>>(`/appointments/public/${userId}`, appointmentData),

  // Private endpoints (owner only)
  getAppointments: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ appointments: any[] }>>('/appointments', { params }),

  getAppointment: (appointmentId: string) =>
    api.get<ApiResponse<{ appointment: any }>>(`/appointments/${appointmentId}`),

  createAppointment: (appointmentData: {
    date: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientSurname: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  }) =>
    api.post<ApiResponse<{ appointment: any }>>('/appointments', appointmentData),

  updateAppointment: (appointmentId: string, appointmentData: any) =>
    api.put<ApiResponse<{ appointment: any }>>(`/appointments/${appointmentId}`, appointmentData),

  deleteAppointment: (appointmentId: string) =>
    api.delete<ApiResponse>(`/appointments/${appointmentId}`),
};

// Closure API
export const closureAPI = {
  // Public endpoints
  getPublicClosures: (userId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ closures: any[] }>>(`/closures/public/${userId}`, { params }),

  // Private endpoints (owner only)
  getClosures: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ closures: any[] }>>('/closures', { params }),

  getClosure: (closureId: string) =>
    api.get<ApiResponse<{ closure: any }>>(`/closures/${closureId}`),

  createClosure: (closureData: {
    date: string;
    isFullDay: boolean;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) =>
    api.post<ApiResponse<{ closure: any }>>('/closures', closureData),

  updateClosure: (closureId: string, closureData: any) =>
    api.put<ApiResponse<{ closure: any }>>(`/closures/${closureId}`, closureData),

  deleteClosure: (closureId: string) =>
    api.delete<ApiResponse>(`/closures/${closureId}`),
};

// Admin API
export const adminAPI = {
  getStats: () =>
    api.get<ApiResponse<{ stats: any; recent: any }>>('/admin/stats'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) =>
    api.get<ApiResponse<{ users: any[]; pagination: any }>>('/admin/users', { params }),

  getBlogs: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) =>
    api.get<ApiResponse<{ blogs: any[]; pagination: any }>>('/admin/blogs', { params }),

  getEvents: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }) =>
    api.get<ApiResponse<{ events: any[]; pagination: any }>>('/admin/events', { params }),

  updateUserRole: (userId: string, role: string) =>
    api.put<ApiResponse<{ user: any }>>(`/admin/users/${userId}/role`, { role }),

  updateBlogStatus: (blogId: string, status: string) =>
    api.put<ApiResponse<{ blog: any }>>(`/admin/blogs/${blogId}/status`, { status }),

  updateEventStatus: (eventId: string, status: string) =>
    api.put<ApiResponse<{ event: any }>>(`/admin/events/${eventId}/status`, { status }),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse>(`/admin/users/${userId}`),
};

export default api;
