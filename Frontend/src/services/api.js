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

// Payouts API
export const payoutsAPI = {
  getMine: (params) => api.get('/payouts/me', { params }),
  request: (data) => api.post('/payouts/request', data),
  adminList: (params) => api.get('/payouts/admin', { params }),
  adminUpdateStatus: (id, status, notes) => api.patch(`/payouts/${id}/status`, { status, notes }),
};

// User API
export const userAPI = {
  getProfile: (id) => api.get(`/user/${id}`),
  registerFisher: (data) => api.post('/user/register-fisher', data),
};

// Catch API
export const catchAPI = {
  getAll: (params) => api.get('/catch', { params }),
  getAvailable: (params) => api.get('/catch/available', { params }),
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

// Order + Payment combined API
export const orderPaymentAPI = {
  createAndPay: (data) => api.post('/order-payment/create-and-pay', data),
  pay: (orderId) => api.post(`/order-payment/pay/${orderId}`),
  quote: (catchId, delivery) => api.post('/order-payment/quote', { catchId, delivery }),
  getAdminDeliveries: () => api.get('/order-payment/deliveries/admin'),
  updateDeliveryStatus: (id, status) => api.patch(`/order-payment/deliveries/${id}/status`, { status }),
  fisherEarnings: (params) => api.get('/order-payment/earnings/me', { params }),
  adminIncome: (params) => api.get('/order-payment/income/admin', { params }),
};

// Fish Freshness API
export const fishFreshnessAPI = {
  detect: (formData) =>
    api.post('/fish-freshness/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  detectUrl: (data) => api.post('/fish-freshness/detect-url', data),
};

export default api;

