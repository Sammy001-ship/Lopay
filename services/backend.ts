import axios from 'axios';
import { LoginResponse, SchoolStats, PendingPayment, EnrolledChild } from '../types';

const API_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the token to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const BackendAPI = {
  auth: {
    login: async (email: string, password?: string) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    },
    register: async (data: { email: string; password?: string; confirmPassword?: string; fullName: string; phoneNumber: string; role: string }) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
  },
  users: {
    get: async (id: string) => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
  },
  school: {
    getStats: async () => {
      const response = await apiClient.get<SchoolStats>('/school-payments/stats');
      return response.data;
    },
    getPendingPayments: async () => {
      const response = await apiClient.get<PendingPayment[]>('/school-payments/pending');
      return response.data;
    },
    confirmPayment: async (paymentId: string) => {
      const response = await apiClient.post('/school-payments/confirm', { paymentId });
      return response.data;
    },
  },
  public: {
    getSchools: async () => {
      const response = await apiClient.get<any[]>('/schools');
      return response.data;
    },
  },
  parent: {
    getChildren: async () => {
      const response = await apiClient.get<EnrolledChild[]>('/enrollments/my-children');
      return response.data;
    },
    enroll: async (data: { 
      childId?: string; 
      childName?: string; 
      schoolId: string; 
      className: string; 
      installmentFrequency: string; 
      firstPaymentPaid: number; 
      receiptUrl?: string;
      termStartDate: string; 
      termEndDate: string 
    }) => {
      const response = await apiClient.post('/enrollments', data);
      return response.data;
    },
    payInstallment: async (enrollmentId: string, amountPaid: number, receiptUrl?: string) => {
      const response = await apiClient.post('/enrollments/pay-installment', { enrollmentId, amountPaid, receiptUrl });
      return response.data;
    },
  },
};