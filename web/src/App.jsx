import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useThemeStore } from './store/themeStore';
import { useSocket } from './hooks/useSocket';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';

/**
 * Root application component
 * Handles auth initialization, socket connection, and routing
 */
export default function App() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { fetchUnreadCounts } = useChatStore();
  const initTheme = useThemeStore((s) => s.initTheme);

  // Initialize socket connection when authenticated
  useSocket();

  // Apply saved light/dark theme on app load
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch unread counts when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCounts();
    }
  }, [isAuthenticated, fetchUnreadCounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading GymBuddy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/discover" replace /> : <LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.isProfileComplete ? (
                <Navigate to="/discover" replace />
              ) : (
                <Navigate to="/profile/setup" replace />
              )
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/profile/setup" replace />
            ) : (
              <SignupPage />
            )
          }
        />

        {/* Profile Setup (no navbar, but requires auth) */}
        <Route
          path="/profile/setup"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />

        {/* Authenticated Routes with Navbar */}
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Navbar />
              <DiscoverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Navbar />
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Navbar />
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <Navbar />
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <Navbar />
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
