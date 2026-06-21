import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api, { setAccessToken, getAccessToken } from '../api/axios';

/**
 * Platform-aware secure storage helper.
 * Uses SecureStore on native (iOS/Android), falls back to AsyncStorage on web
 * since expo-secure-store doesn't support the web platform.
 */
const SecureStorage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(`secure_${key}`);
    }
    return SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, value) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(`secure_${key}`, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(`secure_${key}`);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

/**
 * Auth store — manages current user, access token, and auth actions
 * Mobile version uses SecureStore for refresh token, AsyncStorage for user cache
 * Includes OTP signup flow (sendOtp → verifyOtp → resendOtp)
 * Session persists until explicit logout
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
  setAccessToken: (token) => {
    setAccessToken(token);
    set({ accessToken: token });
  },

  /**
   * Step 1 — Send OTP to email for signup verification
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
      Toast.show({
        type: 'success',
        text1: 'Verification code sent! 📧',
        text2: 'Check your email for the 6-digit code',
      });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to send verification code';
      Toast.show({ type: 'error', text1: message });
      throw error;
    }
  },

  /**
   * Step 2 — Verify OTP and create user account
   */
  verifyOtp: async ({ email, otp }) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/signup/verify-otp', {
        email,
        otp,
      });
      const { user, accessToken, refreshToken } = response.data.data;

      // Store refresh token securely
      await SecureStorage.setItemAsync('refreshToken', refreshToken);
      // Cache user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isSubmitting: false,
      });
      Toast.show({ type: 'success', text1: 'Account created! 🎉' });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Verification failed';
      Toast.show({ type: 'error', text1: message });
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
      Toast.show({ type: 'success', text1: 'New code sent! 📧' });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to resend code';
      Toast.show({ type: 'error', text1: message });
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
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStorage.setItemAsync('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setAccessToken(accessToken);
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isSubmitting: false,
      });
      Toast.show({ type: 'success', text1: 'Welcome back! 💪' });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Login failed';
      Toast.show({ type: 'error', text1: message });
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
    await SecureStorage.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('user');
    setAccessToken(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    Toast.show({ type: 'success', text1: 'Logged out successfully' });
  },

  /**
   * Permanently delete the account (requires password confirmation), then
   * clear all local session state — mirrors logout's cleanup.
   */
  deleteAccount: async (password) => {
    set({ isSubmitting: true });
    try {
      await api.delete('/users/account', { data: { password } });
      await SecureStorage.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('user');
      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isSubmitting: false,
      });
      Toast.show({ type: 'success', text1: 'Your account has been deleted' });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      const message =
        error.response?.data?.message || 'Failed to delete account';
      Toast.show({ type: 'error', text1: message });
      throw error;
    }
  },

  /**
   * Check authentication status on app load
   * Attempts to refresh token from SecureStore
   * Session persists until explicit logout
   */
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const refreshTokenValue = await SecureStorage.getItemAsync('refreshToken');

      if (!refreshTokenValue) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Try to refresh
      const refreshResponse = await api.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });
      const { accessToken, refreshToken: newRefreshToken } =
        refreshResponse.data.data;

      await SecureStorage.setItemAsync('refreshToken', newRefreshToken);
      setAccessToken(accessToken);
      set({ accessToken });

      // Fetch current user
      const meResponse = await api.get('/auth/me');
      const { user } = meResponse.data.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Not authenticated — clear everything
      await SecureStorage.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('user');
      setAccessToken(null);
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
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isSubmitting: false });
      Toast.show({ type: 'success', text1: 'Profile updated! ✨' });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Update failed';
      Toast.show({ type: 'error', text1: message });
      throw error;
    }
  },

  /**
   * Upload profile photo
   */
  uploadPhoto: async (uri) => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      });

      const response = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data, // Prevent axios from trying to serialize FormData
      });
      const { user } = response.data.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
      Toast.show({ type: 'success', text1: 'Photo uploaded! 📸' });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      Toast.show({ type: 'error', text1: message });
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
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
      Toast.show({ type: 'success', text1: 'Photo removed' });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed';
      Toast.show({ type: 'error', text1: message });
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
      Toast.show({
        type: 'success',
        text1: 'Verification code sent! 📧',
        text2: 'Check your email for the 6-digit code',
      });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Failed to send verification code';
      Toast.show({ type: 'error', text1: message });
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
      Toast.show({ type: 'success', text1: 'Password changed successfully! 🎉' });
      return response.data;
    } catch (error) {
      set({ isSubmitting: false });
      const message = error.response?.data?.message || 'Password change failed';
      Toast.show({ type: 'error', text1: message });
      throw error;
    }
  },
}));
