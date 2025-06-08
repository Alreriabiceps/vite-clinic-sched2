import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance for staff API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add staff auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle staff auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('clinic_token');
      localStorage.removeItem('clinic_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Create separate axios instance for patient API
const patientApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add patient auth token
patientApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patient_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle patient auth errors
patientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('patient_token');
      localStorage.removeItem('patient_refresh_token');
      window.location.href = '/patient/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  createUser: (userData) => api.post('/auth/users', userData),
  getUsers: () => api.get('/auth/users'),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  getDailyAppointments: (doctorName, date) => 
    api.get('/appointments/daily', { 
      params: { doctorName, date } 
    }),
};

// Patients API
export const patientsAPI = {
  search: (params) => api.get('/patients/search', { params }),
  getAll: (params) => api.get('/patients', { params }),
  getById: (patientId) => api.get(`/patients/${patientId}`),
  getStats: () => api.get('/patients/stats/overview'),
  getByStatus: (status, params) => api.get(`/patients/status/${status}`, { params }),
  createPediatric: (data) => api.post('/patients/pediatric', data),
  createObGyne: (data) => api.post('/patients/ob-gyne', data),
  update: (patientId, data) => api.put(`/patients/${patientId}`, data),
  delete: (patientId) => api.delete(`/patients/${patientId}`),
  addImmunization: (patientId, data) => api.post(`/patients/${patientId}/immunizations`, data),
  addConsultation: (patientId, data) => api.post(`/patients/${patientId}/consultations`, data),
  addNote: (patientId, data) => api.post(`/patients/${patientId}/notes`, data),
};

// Reports API
export const reportsAPI = {
  getDailyReport: (params) => api.get('/reports/daily', { params }),
  getWeeklyReport: (params) => api.get('/reports/weekly', { params }),
  getMonthlyReport: (params) => api.get('/reports/monthly', { params }),
  getDashboardAnalytics: () => api.get('/reports/dashboard'),
};

// Availability API
export const availabilityAPI = {
  getSchedules: () => api.get('/availability/schedules'),
  getSlots: (params) => api.get('/availability/slots', { params }),
  getSummary: (params) => api.get('/availability/summary', { params }),
  checkSlot: (params) => api.get('/availability/check-slot', { params }),
};

// Helper function to handle API errors
export const handleAPIError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

// Patient Portal API
export const patientAuthAPI = {
  register: (data) => patientApi.post('/patient/auth/register', data),
  login: (credentials) => patientApi.post('/patient/auth/login', credentials),
  getProfile: () => patientApi.get('/patient/auth/profile'),
  updateProfile: (data) => patientApi.put('/patient/auth/profile', data),
  changePassword: (data) => patientApi.put('/patient/auth/change-password', data),
};

export const patientBookingAPI = {
  getDoctors: () => patientApi.get('/patient/booking/doctors'),
  getAvailableDates: (params) => patientApi.get('/patient/booking/available-dates', { params }),
  getAvailableSlots: (params) => patientApi.get('/patient/booking/available-slots', { params }),
  bookAppointment: (data) => patientApi.post('/patient/booking/book-appointment', data),
  getMyAppointments: (params) => patientApi.get('/patient/booking/my-appointments', { params }),
  cancelAppointment: (appointmentId, data) => patientApi.put(`/patient/booking/cancel-appointment/${appointmentId}`, data),
};

// Helper function to extract data from API response
export const extractData = (response) => {
  return response.data?.data || response.data;
};

export default api; 