import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import '../global.css';
import { Colors, useThemeStore, THEME_VARS } from '../lib/theme';

/**
 * Root layout — auth gate, splash screen, navigation guard, Toast
 * Handles initial auth check and redirects based on auth state
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  // Load saved light/dark theme on app start
  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  // Initialize socket connection
  useSocket();

  // Check auth on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Navigation guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && !inAuthGroup && segments[0] !== 'onboarding') {
      // Check if onboarding has been shown
      AsyncStorage.getItem('onboarding_done').then((value) => {
        if (value) {
          router.replace('/login');
        } else {
          router.replace('/onboarding');
        }
      });
    } else if (isAuthenticated && inAuthGroup) {
      if (user?.isProfileComplete) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(app)/profile/setup');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <View className="w-14 h-14 rounded-2xl bg-primary-600 items-center justify-center mb-4"
          style={{
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-white text-2xl font-black">G</Text>
        </View>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text className="text-slate-500 mt-3 text-sm">Loading GymBuddy...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View key={theme} style={[{ flex: 1 }, THEME_VARS[theme]]}>
        <Slot />
      </View>
      <Toast
        position="top"
        topOffset={60}
        visibilityTime={3000}
      />
    </GestureHandlerRootView>
  );
}
