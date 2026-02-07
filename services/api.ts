
import { Child, Notification, School, Transaction, User } from '../types';

// Replace this with your actual backend URL provided
const BASE_URL = 'https://api.lopay.app/v1';

const getAuthToken = () => localStorage.getItem('lopay_token');
const setAuthToken = (token: string) => localStorage.setItem('lopay_token', token);
const clearAuthToken = () => localStorage.removeItem('lopay_token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error occurred' }));
    throw new Error(error.message || 'Something went wrong');
  }

  if (response.status === 204) return null;
  return response.json();
};

export const API = {
  auth: {
    login: async (email: string, password?: string): Promise<{ user: User; token: string }> => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      localStorage.setItem('lopay_user_id', data.user.id);
      return data;
    },
    signup: async (userData: any): Promise<{ user: User; token: string }> => {
      const data = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setAuthToken(data.token);
      localStorage.setItem('lopay_user_id', data.user.id);
      return data;
    },
    logout: () => {
      clearAuthToken();
      localStorage.removeItem('lopay_user_id');
    },
    getCurrentUserId: () => localStorage.getItem('lopay_user_id'),
    getUserById: (id: string) => request(`/users/${id}`),
  },
  schools: {
    list: () => request('/schools'),
    add: (school: School) => request('/schools', { method: 'POST', body: JSON.stringify(school) }),
    update: (school: School) => request(`/schools/${school.id}`, { method: 'PUT', body: JSON.stringify(school) }),
    delete: (id: string) => request(`/schools/${id}`, { method: 'DELETE' }),
    deleteAll: () => request('/schools', { method: 'DELETE' }),
  },
  children: {
    list: () => request('/children'),
    add: (child: Child) => request('/children', { method: 'POST', body: JSON.stringify(child) }),
    delete: (id: string) => request(`/children/${id}`, { method: 'DELETE' }),
    updateAll: (children: Child[]) => request('/children/batch', { method: 'PUT', body: JSON.stringify(children) }),
  },
  transactions: {
    list: () => request('/transactions'),
    add: (transaction: Transaction) => request('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
    updateAll: (transactions: Transaction[]) => request('/transactions/batch', { method: 'PUT', body: JSON.stringify(transactions) }),
    approve: (id: string) => request(`/transactions/${id}/approve`, { method: 'POST' }),
    decline: (id: string) => request(`/transactions/${id}/decline`, { method: 'POST' }),
  },
  notifications: {
    list: () => request('/notifications'),
    add: (notification: Notification) => request('/notifications', { method: 'POST', body: JSON.stringify(notification) }),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'POST' }),
  },
  users: {
    list: () => request('/users'),
    update: (user: User) => request(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) }),
    delete: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
  }
};
