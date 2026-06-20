import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
} from 'lucide-react-native';
import { format } from 'date-fns';
import { useAuthStore } from '../../../store/authStore';

/**
 * Profile tab — displays current user's profile details
 */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

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
          <View className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Cover */}
            <View style={{ height: 128, backgroundColor: '#4f46e5' }} />

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
                    backgroundColor: '#e0e7ff',
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
                      color: '#4f46e5',
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
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                {user.name}
              </Text>

              {user.bio ? (
                <Text
                  style={{
                    color: '#64748b',
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f1f5f9' }}>
                    <MapPin size={14} color="#94a3b8" />
                    <Text style={{ color: '#334155', fontSize: 12, fontWeight: '500' }}>
                      {user.gymName}
                    </Text>
                  </View>
                ) : null}
                {user.workoutType ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eef2ff' }}>
                    <Dumbbell size={14} color="#4338ca" />
                    <Text style={{ color: '#4338ca', fontSize: 12, fontWeight: '500' }}>
                      {user.workoutType}
                    </Text>
                  </View>
                ) : null}
                {user.timing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#ecfdf5' }}>
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
              backgroundColor: 'white',
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
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Account Details
            </Text>

            <View style={{ gap: 16 }}>
              {/* Email */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#eef2ff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#6366f1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>Email</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                    {user.email}
                  </Text>
                </View>
              </View>

              {/* Member Since */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#ecfdf5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>Member Since</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                    {user.createdAt
                      ? format(new Date(user.createdAt), 'MMMM d, yyyy')
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Profile Status */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#fff1f2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <Dumbbell size={20} color="#f43f5e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>Profile Status</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: user.isProfileComplete ? '#059669' : '#d97706' }}>
                    {user.isProfileComplete ? '✓ Complete' : 'Incomplete'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-4 gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile/edit')}
              className="w-full py-4 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
              style={{
                shadowColor: '#4f46e5',
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
              className="w-full py-4 bg-white rounded-xl flex-row items-center justify-center gap-2 border border-slate-200"
            >
              <Lock size={18} color="#475569" />
              <Text className="text-slate-700 font-semibold text-base">
                Change Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="w-full py-4 bg-white rounded-xl flex-row items-center justify-center gap-2 border border-red-100"
            >
              <LogOut size={18} color="#ef4444" />
              <Text className="text-red-500 font-semibold text-base">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
