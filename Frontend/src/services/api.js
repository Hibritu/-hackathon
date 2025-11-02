import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginEmail: (data) => api.post('/auth/login-email', data),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
};

// User API
export const userAPI = {
  getProfile: (id) => api.get(`/user/${id}`),
  registerFisher: (data) => api.post('/user/register-fisher', data),
};

// Catch API
export const catchAPI = {
  getAll: (params) => api.get('/catch', { params }),
  getMyCatches: () => api.get('/catch/my-catches'),
  getAllForAdmin: () => api.get('/catch/all'),
  create: (data) => api.post('/catch', data),
  update: (id, data) => api.put(`/catch/${id}`, data),
  delete: (id) => api.delete(`/catch/${id}`),
  verify: (id, data) => api.patch(`/catch/${id}/verify`, data),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/order', data),
  getMyOrders: () => api.get('/order/my-orders'),
  getAll: () => api.get('/order/all'),
  updatePayment: (id, data) => api.patch(`/order/${id}/payment`, data),
};

// Verify API
export const verifyAPI = {
  verifyQR: (data) => api.post('/verify', data),
};

// Delivery API
export const deliveryAPI = {
  create: (data) => api.post('/delivery', data),
  getByOrder: (orderId) => api.get(`/delivery/order/${orderId}`),
  getAll: () => api.get('/delivery/all'),
  getMyDeliveries: () => api.get('/delivery/my-deliveries'),
  updateStatus: (id, data) => api.patch(`/delivery/${id}/status`, data),
  assign: (id, data) => api.patch(`/delivery/${id}/assign`, data),
};

// Payment API
export const paymentAPI = {
  initiatePayment: (data) => api.post('/chapa/pay', data),
};

export default api;

