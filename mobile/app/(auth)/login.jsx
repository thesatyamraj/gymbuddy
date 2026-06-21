import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Dumbbell } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../lib/theme';

/**
 * Login screen with email/password form and React Hook Form validation
 */
export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isSubmitting } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      if (result.data.user.isProfileComplete) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(app)/profile/setup');
      }
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-primary-600 rounded-2xl items-center justify-center mb-4"
              style={{
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Dumbbell size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-slate-900">Welcome Back</Text>
            <Text className="text-slate-500 mt-1">Enter your credentials to continue</Text>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-1.5">Email</Text>
            <View className="relative">
              <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                <Mail size={16} color={Colors.iconFaint} />
              </View>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.iconFaint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-slate-700 mb-1.5">Password</Text>
            <View className="relative">
              <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                <Lock size={16} color={Colors.iconFaint} />
              </View>
              <Controller
                control={control}
                name="password"
                rules={{ required: 'Password is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                    placeholder="••••••••"
                    placeholderTextColor={Colors.iconFaint}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-0 bottom-0 justify-center"
              >
                {showPassword ? (
                  <EyeOff size={16} color={Colors.iconFaint} />
                ) : (
                  <Eye size={16} color={Colors.iconFaint} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-600 rounded-xl items-center justify-center flex-row gap-2"
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : null}
            <Text className="text-white font-semibold text-base">
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-slate-500 text-sm">Don't have an account? </Text>
            <Link href="/signup" className="text-primary-600 font-semibold text-sm">
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
