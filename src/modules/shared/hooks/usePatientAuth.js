import { patientAuthAPI, handleAPIError, extractData } from "../lib/api";
import { toast } from "../components/ui/toaster";
import { create } from "zustand";
import { useEffect } from "react";
const usePatientAuthStore = create((set, get) => ({
  patient: null,
  loading: true,
  error: null,
  initialized: false,

  // Initialize auth state from localStorage
  initialize: async () => {
    const { initialized } = get();
    if (initialized) return;

    set({ initialized: true });

    try {
      const token = localStorage.getItem("patient_token");
      if (!token) {
        set({ loading: false });
        return;
      }

      const response = await patientAuthAPI.getProfile();
      const userData = extractData(response);

      set({
        patient: userData.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Patient auth initialization error:", error);
      localStorage.removeItem("patient_token");
      localStorage.removeItem("patient_refresh_token");
      set({
        patient: null,
        loading: false,
        error: handleAPIError(error),
      });
    }
  },

  // Register function
  register: async (registrationData) => {
    try {
      set({ loading: true, error: null });

      const response = await patientAuthAPI.register(registrationData);
      const data = extractData(response);

      // Store tokens
      localStorage.setItem("patient_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("patient_refresh_token", data.refreshToken);
      }

      set({
        patient: data.user,
        loading: false,
        error: null,
      });

      toast.success(`Welcome to VM Clinic, ${data.user.firstName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({
        patient: null,
        loading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Login function
  login: async (credentials) => {
    try {
      set({ loading: true, error: null });

      const response = await patientAuthAPI.login(credentials);
      const data = extractData(response);

      // Store tokens
      localStorage.setItem("patient_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("patient_refresh_token", data.refreshToken);
      }

      set({
        patient: data.user,
        loading: false,
        error: null,
      });

      toast.success(`Welcome back, ${data.user.firstName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({
        patient: null,
        loading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Logout function
  logout: async () => {
    try {
      localStorage.removeItem("patient_token");
      localStorage.removeItem("patient_refresh_token");
      set({
        patient: null,
        loading: false,
        error: null,
        initialized: false,
      });
      toast.info("You have been logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Update profile function
  updateProfile: async (profileData) => {
    try {
      const response = await patientAuthAPI.updateProfile(profileData);
      const data = extractData(response);

      set({ patient: data.user });
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Change password function
  changePassword: async (passwordData) => {
    try {
      await patientAuthAPI.changePassword(passwordData);
      toast.success("Password changed successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export const usePatientAuth = () => {
  const store = usePatientAuthStore();

  // Initialize on first use with useEffect to avoid setState during render
  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized, store.initialize]);

  return store;
};
