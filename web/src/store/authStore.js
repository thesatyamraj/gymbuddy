import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Auth store — manages current user, access token, and auth actions
 * Includes OTP signup flow (sendOtp → verifyOtp → resendOtp)
 * Session persists via httpOnly refresh token cookie until explicit logout
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,

  /**
   * Set the access token (used by interceptor after refresh)
   */
  setAccessToken: (token) => set({ accessToken: token }),

  /**
   * Step 1 — Send OTP to email for signup verification
   * Stores name, email, password temporarily on server; sends 6-digit OTP
   */
  sendOtp: async ({ name, email, password }) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/signup/send-otp', {
        name,
        email,
        password,
      });
      set({ isSubmitting: false });
      toast.success('Verification code sent to your email! 📧');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Step 2 — Verify OTP and create user account
   * On success: user is authenticated, tokens are set, account is created
   */
  verifyOtp: async ({ email, otp }) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/signup/verify-otp', {
        email,
        otp,
      });
      const { user, accessToken } = response.data.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isSubmitting: false,
      });
      toast.success('Account created successfully! 🎉');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Resend OTP — rate-limited to 60s between sends
   */
  resendOtp: async (email) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/signup/resend-otp', { email });
      set({ isSubmitting: false });
      toast.success('New verification code sent! 📧');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  login: async (data) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isSubmitting: false,
      });
      toast.success('Welcome back! 💪');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Logout and clear state
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Silent fail — still clear local state
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    toast.success('Logged out successfully');
  },

  /**
   * Check authentication status on app load
   * Uses httpOnly refresh token cookie — session persists across tabs/refreshes
   * User stays logged in until they explicitly logout
   */
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Try to refresh token from httpOnly cookie
      const refreshResponse = await api.post('/auth/refresh');
      const { accessToken } = refreshResponse.data.data;

      set({ accessToken });

      // Fetch current user
      const meResponse = await api.get('/auth/me');
      const { user } = meResponse.data.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Update the user object in state
   */
  setUser: (user) => set({ user }),

  /**
   * Update profile
   */
  updateProfile: async (data) => {
    set({ isSubmitting: true });
    try {
      const response = await api.put('/users/profile', data);
      const { user } = response.data.data;
      set({ user, isSubmitting: false });
      toast.success('Profile updated! ✨');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Upload profile photo
   */
  uploadPhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { user } = response.data.data;
      set({ user });
      toast.success('Photo uploaded! 📸');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Delete profile photo
   */
  deletePhoto: async () => {
    try {
      const response = await api.delete('/users/profile/photo');
      const { user } = response.data.data;
      set({ user });
      toast.success('Photo removed');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Step 1 — Send OTP for password change (verifies current password first)
   */
  sendPasswordChangeOtp: async (currentPassword, newPassword) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/change-password/send-otp', {
        currentPassword,
        newPassword,
      });
      set({ isSubmitting: false });
      toast.success('Verification code sent to your email! 📧');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Step 2 — Verify OTP and change password
   */
  changePassword: async (otp) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/change-password/verify', { otp });
      set({ isSubmitting: false });
      toast.success('Password changed successfully! 🎉');
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  },
}));
