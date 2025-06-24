import { create } from 'zustand';
import { useEffect } from 'react';
import { authAPI, handleAPIError, extractData } from '../lib/api';
import { toast } from '../components/ui/toast';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  // Initialize auth state from localStorage
  initialize: async () => {
    const { initialized } = get();
    if (initialized) return;
    
    set({ initialized: true });
    
    try {
      const token = localStorage.getItem('clinic_token');
      if (!token) {
        set({ loading: false });
        return;
      }

      const response = await authAPI.getProfile();
      const userData = extractData(response);
      
      set({ 
        user: userData.user, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('clinic_token');
      localStorage.removeItem('clinic_refresh_token');
      set({ 
        user: null, 
        loading: false, 
        error: handleAPIError(error) 
      });
    }
  },

  // Login function
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      const response = await authAPI.login(credentials);
      const data = extractData(response);
      
      // Store tokens
      localStorage.setItem('clinic_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('clinic_refresh_token', data.refreshToken);
      }
      
      set({ 
        user: data.user, 
        loading: false, 
        error: null 
      });
      
      toast.success(`Welcome back, ${data.user.firstName}!`);
      return { success: true };
      
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ 
        user: null, 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Logout function
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('clinic_token');
      localStorage.removeItem('clinic_refresh_token');
      set({ 
        user: null, 
        loading: false, 
        error: null,
        initialized: false
      });
      toast.info('You have been logged out');
    }
  },

  // Change password function
  changePassword: async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Update user data
  updateUser: (userData) => set({ user: userData }),
}));

export const useAuth = () => {
  const store = useAuthStore();
  
  // Initialize on first use with useEffect to avoid setState during render
  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized, store.initialize]);
  
  return store;
}; 