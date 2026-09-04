import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to unwrap data
client.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Dashboard
  getDashboardSummary: () => client.get('/dashboard/summary'),
  getOverdue: () => client.get('/dashboard/overdue'),
  getTopDebtors: () => client.get('/dashboard/top-debtors'),

  // Customers
  getCustomers: () => client.get('/customers'),
  getCustomer: (id) => client.get(`/customers/${id}`),
  createCustomer: (data) => client.post('/customers', data),
  updateCustomer: (id, data) => client.put(`/customers/${id}`, data),
  deleteCustomer: (id) => client.delete(`/customers/${id}`),
  settleCustomer: (id) => client.post(`/customers/${id}/settle`),

  // Credit Records
  getRecords: (params) => client.get('/records', { params }),
  getRecord: (id) => client.get(`/records/${id}`),
  createRecord: (data) => client.post('/records', data),
  updateRecord: (id, data) => client.put(`/records/${id}`, data),
  deleteRecord: (id) => client.delete(`/records/${id}`),

  // Payments
  getPayments: (params) => client.get('/payments', { params }),
  createPayment: (data) => client.post('/payments', data),
  deletePayment: (id) => client.delete(`/payments/${id}`),

  // Reports
  getMonthlyReport: (month) => client.get('/reports/monthly', { params: { month } }),
  getCustomerReport: (id) => client.get(`/reports/customer/${id}`),

  // Profile
  getProfile: () => client.get('/profile'),
  updateProfile: (data) => client.put('/profile', data),
  resetDemo: () => client.post('/profile/reset-demo'),

  // Health
  checkHealth: () => client.get('/health')
};

export default api;
