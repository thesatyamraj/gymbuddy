import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  User,
  Dumbbell,
  MapPin,
  Clock,
  Edit,
  Mail,
  Calendar,
  LogOut,
  Lock,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../../store/authStore';
import { Colors, useThemeStore } from '../../../lib/theme';

/**
 * Profile tab — displays current user's profile details
 */
export default function ProfileScreen() {
  const { user, logout, deleteAccount, isSubmitting } = useAuthStore();
  const router = useRouter();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const closeDelete = () => {
    if (isSubmitting) return;
    setShowDelete(false);
    setDeletePassword('');
    setConfirmText('');
  };

  const canDelete =
    deletePassword.length > 0 && confirmText.trim().toUpperCase() === 'DELETE';

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(deletePassword);
      router.replace('/login');
    } catch {
      // Error toast handled in the store; keep the modal open to retry.
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="px-4 pt-4">
          {/* Profile Card */}
          <View className="bg-surface rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Cover */}
            <View style={{ height: 128, backgroundColor: Colors.primary }} />

            {/* Avatar */}
            <View style={{ alignItems: 'center', marginTop: -56 }}>
              {user.profilePhoto && user.profilePhoto.length > 0 ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 24,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 24,
                    backgroundColor: Colors.primarySurface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 48,
                      fontWeight: '700',
                      color: Colors.primary,
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.text,
                  textAlign: 'center',
                }}
              >
                {user.name}
              </Text>

              {user.bio ? (
                <Text
                  style={{
                    color: Colors.textMuted,
                    marginTop: 8,
                    textAlign: 'center',
                    lineHeight: 20,
                    maxWidth: 280,
                  }}
                >
                  {user.bio}
                </Text>
              ) : null}

              {/* Tags */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {user.gymName ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.sunken }}>
                    <MapPin size={14} color={Colors.iconFaint} />
                    <Text style={{ color: Colors.textStrong, fontSize: 12, fontWeight: '500' }}>
                      {user.gymName}
                    </Text>
                  </View>
                ) : null}
                {user.workoutType ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primarySurface }}>
                    <Dumbbell size={14} color={Colors.primaryDark} />
                    <Text style={{ color: Colors.primaryDark, fontSize: 12, fontWeight: '500' }}>
                      {user.workoutType}
                    </Text>
                  </View>
                ) : null}
                {user.timing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.emeraldSurface }}>
                    <Clock size={14} color="#059669" />
                    <Text style={{ color: '#059669', fontSize: 12, fontWeight: '500' }}>
                      {user.timing}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 24,
              marginTop: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.iconFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Account Details
            </Text>

            <View style={{ gap: 16 }}>
              {/* Email */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: Colors.primarySurface, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color={Colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: Colors.iconFaint }}>Email</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.textStrong }}>
                    {user.email}
                  </Text>
                </View>
              </View>

              {/* Member Since */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: Colors.emeraldSurface, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: Colors.iconFaint }}>Member Since</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.textStrong }}>
                    {user.createdAt
                      ? format(new Date(user.createdAt), 'MMMM d, yyyy')
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Profile Status */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: Colors.roseSurface, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Dumbbell size={20} color="#f43f5e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: Colors.iconFaint }}>Profile Status</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: user.isProfileComplete ? '#059669' : '#d97706' }}>
                    {user.isProfileComplete ? '✓ Complete' : 'Incomplete'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-4 gap-3">
            {/* Appearance toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              className="w-full px-4 py-4 bg-surface rounded-xl flex-row items-center justify-between border border-slate-200"
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? Colors.primarySurface : Colors.emeraldSurface,
                  }}
                >
                  {isDark ? (
                    <Moon size={18} color={Colors.primaryLight} />
                  ) : (
                    <Sun size={18} color={Colors.emeraldDark} />
                  )}
                </View>
                <View>
                  <Text className="text-slate-900 font-semibold text-base">Appearance</Text>
                  <Text className="text-slate-500 text-xs">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </Text>
                </View>
              </View>
              {/* mini switch */}
              <View
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 999,
                  padding: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: isDark ? 'flex-end' : 'flex-start',
                  backgroundColor: isDark ? Colors.primary : Colors.borderStrong,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    backgroundColor: Colors.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isDark ? (
                    <Moon size={13} color={Colors.primary} />
                  ) : (
                    <Sun size={13} color={Colors.emeraldDark} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(app)/profile/edit')}
              className="w-full py-4 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
              style={{
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Edit size={18} color="white" />
              <Text className="text-white font-semibold text-base">
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(app)/profile/change-password')}
              className="w-full py-4 bg-surface rounded-xl flex-row items-center justify-center gap-2 border border-slate-200"
            >
              <Lock size={18} color={Colors.textBody} />
              <Text className="text-slate-700 font-semibold text-base">
                Change Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="w-full py-4 bg-surface rounded-xl flex-row items-center justify-center gap-2 border border-red-100"
            >
              <LogOut size={18} color="#ef4444" />
              <Text className="text-red-500 font-semibold text-base">
                Log Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDelete(true)}
              className="w-full py-4 rounded-xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: Colors.roseSurface, borderWidth: 1, borderColor: Colors.roseSurface2 }}
            >
              <Trash2 size={18} color={Colors.error} />
              <Text style={{ color: Colors.error, fontWeight: '600', fontSize: 16 }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={showDelete}
        animationType="fade"
        transparent
        onRequestClose={closeDelete}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: Colors.surface, borderRadius: 24, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.roseSurface, alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.text }}>Delete your account?</Text>
                <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 2 }}>
                  This permanently removes your profile, matches, chats and messages. It can't be undone.
                </Text>
              </View>
              <TouchableOpacity onPress={closeDelete} style={{ padding: 4 }}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.textMuted, marginBottom: 6 }}>
                  Confirm your password
                </Text>
                <TextInput
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Your password"
                  placeholderTextColor={Colors.iconFaint}
                  secureTextEntry
                  style={{ paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg, fontSize: 14, color: Colors.textSecondary }}
                />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.textMuted, marginBottom: 6 }}>
                  Type DELETE to confirm
                </Text>
                <TextInput
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="DELETE"
                  placeholderTextColor={Colors.iconFaint}
                  autoCapitalize="characters"
                  style={{ paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg, fontSize: 14, color: Colors.textSecondary }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={closeDelete}
                  disabled={isSubmitting}
                  style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', opacity: isSubmitting ? 0.5 : 1 }}
                >
                  <Text style={{ fontWeight: '600', color: Colors.textBody }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  disabled={!canDelete || isSubmitting}
                  style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, opacity: !canDelete || isSubmitting ? 0.5 : 1 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ fontWeight: '700', color: '#ffffff' }}>Delete forever</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
