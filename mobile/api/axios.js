import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Platform-aware secure storage helper.
 * Uses SecureStore on native (iOS/Android), falls back to AsyncStorage on web.
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
 * Axios instance for mobile API calls
 * Uses SecureStore for refresh token (instead of httpOnly cookies)
 * Interceptor attaches JWT and handles 401 refresh flow
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** In-memory access token reference (set by authStore) */
let accessToken = null;

/**
 * Set the access token for the interceptor
 * @param {string|null} token
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Get the current access token
 * @returns {string|null}
 */
export const getAccessToken = () => accessToken;

/** Request interceptor — attach access token */
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Response interceptor — handle 401 and refresh token */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Mobile uses SecureStore for refresh token (not cookies)
        const refreshTokenValue = await SecureStorage.getItemAsync('refreshToken');

        if (!refreshTokenValue) {
          throw new Error('No refresh token');
        }

        const response = await api.post('/auth/refresh', {
          refreshToken: refreshTokenValue,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens
        accessToken = newAccessToken;
        await SecureStorage.setItemAsync('refreshToken', newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear stored tokens on refresh failure
        accessToken = null;
        await SecureStorage.deleteItemAsync('refreshToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
