import axios from 'axios';

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:8000/api'
    : 'https://express-clinic-sched2.onrender.com/api');

// Ensure the URL always ends with /api
const normalizedURL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
const FINAL_API_URL = normalizedURL;

// Request throttling: Track pending requests to prevent duplicates
const pendingRequests = new Map();
const REQUEST_COOLDOWN = 1000; // 1 second cooldown between identical requests

// Rate limiting: Track request timing to avoid 429 errors
const requestTimestamps = [];
const MAX_REQUESTS_PER_SECOND = 30; // Maximum requests per second
const RATE_LIMIT_WINDOW = 1000; // 1 second window

// Generate a unique key for a request
const getRequestKey = (config) => {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
};

// Throttle interceptor to prevent duplicate requests and rate limiting
const throttleInterceptor = async (config) => {
  const requestKey = getRequestKey(config);
  const now = Date.now();

  // Rate limiting: Check if we're making too many requests too quickly
  requestTimestamps.push(now);

  // Remove timestamps older than the rate limit window
  const recentTimestamps = requestTimestamps.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentTimestamps);

  // If we're at the limit, wait before proceeding
  if (recentTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    const oldestTimestamp = recentTimestamps[0];
    const waitTime = RATE_LIMIT_WINDOW - (now - oldestTimestamp) + 100; // Add buffer
    if (waitTime > 0 && waitTime < 2000) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Check if same request was made recently (deduplication)
  if (pendingRequests.has(requestKey)) {
    const lastRequestTime = pendingRequests.get(requestKey);
    const timeSinceLastRequest = Date.now() - lastRequestTime;

    if (timeSinceLastRequest < REQUEST_COOLDOWN) {
      // Request is too soon, create an abort controller to cancel it
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      // Return config - axios will handle the aborted signal
      return config;
    }
  }

  // Update last request time
  pendingRequests.set(requestKey, Date.now());

  // Clean up old entries (older than 5 seconds)
  const currentTime = Date.now();
  for (const [key, time] of pendingRequests.entries()) {
    if (currentTime - time > 5000) {
      pendingRequests.delete(key);
    }
  }

  return config;
};

// Debug logging
console.log('API Configuration:', {
  MODE: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  FINAL_API_URL: FINAL_API_URL
});

// Create axios instance for staff API
const api = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for throttling (runs first)
api.interceptors.request.use(throttleInterceptor, (error) => {
  return Promise.reject(error);
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
    // Suppress CanceledError messages (expected from request throttling)
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      // Create a silent rejection that won't trigger error handlers
      return Promise.reject({ ...error, silent: true });
    }

    if (error.response?.status === 401) {
      // Don't redirect if we're on patient routes or login pages
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isOnLoginPage = window.location.pathname === '/login';
      const isOnPatientRoute = window.location.pathname.startsWith('/patient');
      
      // Only redirect admin auth errors if we're NOT on patient routes
      if (!isLoginRequest && !isOnLoginPage && !isOnPatientRoute) {
        localStorage.removeItem('clinic_token');
        localStorage.removeItem('clinic_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Create separate axios instance for patient API
const patientApi = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for throttling (runs first)
patientApi.interceptors.request.use(throttleInterceptor, (error) => {
  return Promise.reject(error);
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
    // Suppress CanceledError messages (expected from request throttling)
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      // Create a silent rejection that won't trigger error handlers
      return Promise.reject({ ...error, silent: true });
    }

    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page or if it's a login request
      const isLoginRequest = error.config?.url?.includes('/patient/auth/login');
      const isOnLoginPage = window.location.pathname === '/patient/login';
      
      if (!isLoginRequest && !isOnLoginPage) {
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient_refresh_token');
        window.location.href = '/patient/login';
      }
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
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  updateDiagnosis: (id, diagnosis) => api.patch(`/appointments/${id}/diagnosis`, { diagnosis }),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  approveCancellation: (id, data) => api.patch(`/appointments/${id}/approve-cancellation`, data),
  rejectCancellation: (id, data) => api.patch(`/appointments/${id}/reject-cancellation`, data),
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
  create: (data) => api.post('/patients', data),
  update: (patientId, data) => api.put(`/patients/${patientId}`, data),
  delete: (patientId) => api.delete(`/patients/${patientId}`),
  addImmunization: (patientId, data) => api.post(`/patients/${patientId}/immunizations`, data),
  updateImmunization: (patientId, immunizationId, data) => api.put(`/patients/${patientId}/immunizations/${immunizationId}`, data),
  deleteImmunization: (patientId, immunizationId) => api.delete(`/patients/${patientId}/immunizations/${immunizationId}`),
  addConsultation: (patientId, data) => api.post(`/patients/${patientId}/consultations`, data),
  updateConsultation: (patientId, consultationId, data) => api.put(`/patients/${patientId}/consultations/${consultationId}`, data),
  deleteConsultation: (patientId, consultationId) => api.delete(`/patients/${patientId}/consultations/${consultationId}`),
  addNote: (patientId, data) => api.post(`/patients/${patientId}/notes`, data),
  unlockAppointments: (patientId) => api.patch(`/patients/${patientId}/unlock-appointments`),
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

// Settings API
export const settingsAPI = {
  getClinicSettings: () => api.get('/settings/clinic'),
  updateClinicSettings: (data) => api.put('/settings/clinic', data),
};

// Helper function to handle API errors
export const handleAPIError = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    // If there are validation errors, show them
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
    }
    // Otherwise show the message
    if (data.message) {
      return data.message;
    }
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
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
  requestCancellation: (appointmentId, data) => patientApi.post(`/patient/booking/request-cancellation/${appointmentId}`, data),
  requestReschedule: (appointmentId, data) => patientApi.post(`/patient/booking/request-reschedule/${appointmentId}`, data),
  acceptReschedule: (appointmentId) => patientApi.post(`/patient/booking/accept-reschedule/${appointmentId}`),
  cancelReschedule: (appointmentId) => patientApi.post(`/patient/booking/cancel-reschedule/${appointmentId}`),
  acceptCancellation: (appointmentId) => patientApi.post(`/patient/booking/accept-cancellation/${appointmentId}`),
  markNoShow: (appointmentId) => patientApi.post(`/patient/booking/mark-no-show/${appointmentId}`),
};

// Helper function to extract data from API response
export const extractData = (response) => {
  return response.data?.data || response.data;
};

export default api; 