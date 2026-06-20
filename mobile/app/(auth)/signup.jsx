import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Dumbbell,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

/**
 * Two-step signup screen:
 * Step 1: Name + Email + Password form
 * Step 2: 6-digit OTP verification with auto-submit
 */
export default function SignupScreen() {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [showPassword, setShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { sendOtp, verifyOtp, resendOtp, isSubmitting } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first OTP input when entering step 2
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  // Shake animation for error
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Step 1: Submit user details and request OTP
  const onSubmitDetails = async (data) => {
    try {
      await sendOtp(data);
      setSignupEmail(data.email);
      setSignupName(data.name);
      setStep(2);
      setResendCooldown(60);
    } catch (error) {
      // Error handled by store
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    setOtpError(false);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newValues.every((v) => v !== '')) {
      handleVerifyOtp(newValues.join(''));
    }
  };

  // Handle OTP backspace
  const handleOtpKeyPress = (index, key) => {
    if (key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(
    async (otpString) => {
      if (isSubmitting) return;
      try {
        await verifyOtp({ email: signupEmail, otp: otpString });
        router.replace('/(app)/profile/setup');
      } catch (error) {
        setOtpError(true);
        triggerShake();
        setOtpValues(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    },
    [signupEmail, verifyOtp, router, isSubmitting]
  );

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtp(signupEmail);
      setResendCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError(false);
      otpRefs.current[0]?.focus();
    } catch (error) {
      // Error handled by store
    }
  };

  // ─── Step 1: Details Form ─────────────────────────────
  if (step === 1) {
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
            <View className="items-center mb-6">
              <View
                className="w-16 h-16 bg-primary-600 rounded-2xl items-center justify-center mb-4"
                style={{
                  shadowColor: '#4f46e5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Dumbbell size={32} color="white" />
              </View>
              <Text className="text-2xl font-bold text-slate-900">Create Account</Text>
              <Text className="text-slate-500 mt-1">Start your fitness journey with a partner</Text>
            </View>

            {/* Step indicator */}
            <View className="flex-row items-center justify-center mb-8 gap-2">
              <View className="flex-row items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200">
                <View className="w-5 h-5 bg-primary-600 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">1</Text>
                </View>
                <Text className="text-primary-700 text-xs font-semibold">Your Details</Text>
              </View>
              <View className="w-4 h-px bg-slate-300" />
              <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                <View className="w-5 h-5 bg-slate-300 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">2</Text>
                </View>
                <Text className="text-slate-400 text-xs font-semibold">Verify Email</Text>
              </View>
            </View>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Full Name</Text>
              <View className="relative">
                <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                  <User size={16} color="#94a3b8" />
                </View>
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: 'Name is required',
                    maxLength: { value: 50, message: 'Name must be under 50 characters' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm"
                      placeholder="John Doe"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1.5">Email</Text>
              <View className="relative">
                <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                  <Mail size={16} color="#94a3b8" />
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
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm"
                      placeholder="you@example.com"
                      placeholderTextColor="#94a3b8"
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
                  <Lock size={16} color="#94a3b8" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white text-sm"
                      placeholder="At least 6 characters"
                      placeholderTextColor="#94a3b8"
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
                    <EyeOff size={16} color="#94a3b8" />
                  ) : (
                    <Eye size={16} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmitDetails)}
              disabled={isSubmitting}
              className="w-full py-4 bg-primary-600 rounded-xl items-center justify-center flex-row gap-2"
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                shadowColor: '#4f46e5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Mail size={16} color="white" />
              )}
              <Text className="text-white font-semibold text-base">
                {isSubmitting ? 'Sending Code...' : 'Continue & Verify Email'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-slate-500 text-sm">Already have an account? </Text>
              <Link href="/login" className="text-primary-600 font-semibold text-sm">
                Log In
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Step 2: OTP Verification ─────────────────────────
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
          {/* Back button */}
          <TouchableOpacity
            onPress={() => {
              setStep(1);
              setOtpValues(['', '', '', '', '', '']);
              setOtpError(false);
            }}
            className="flex-row items-center gap-1.5 mb-8"
          >
            <ArrowLeft size={16} color="#64748b" />
            <Text className="text-slate-500 text-sm">Back to details</Text>
          </TouchableOpacity>

          {/* OTP Icon */}
          <View className="items-center mb-6">
            <View
              className="w-16 h-16 bg-primary-50 rounded-2xl items-center justify-center mb-4"
              style={{
                borderWidth: 1,
                borderColor: '#c7d2fe',
              }}
            >
              <ShieldCheck size={32} color="#4f46e5" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-2">
              Verify Your Email
            </Text>
            <Text className="text-slate-500 text-center">
              We sent a 6-digit code to
            </Text>
            <Text className="text-primary-600 font-semibold mt-1">
              {signupEmail}
            </Text>
          </View>

          {/* OTP Inputs */}
          <Animated.View
            style={{
              transform: [{ translateX: shakeAnim }],
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            {otpValues.map((value, index) => (
              <TextInput
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                value={value}
                onChangeText={(text) => handleOtpChange(index, text)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48,
                  height: 56,
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: '700',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  borderWidth: 2,
                  borderColor: otpError ? '#ef4444' : value ? '#6366f1' : '#e2e8f0',
                  borderRadius: 12,
                  backgroundColor: value ? '#eef2ff' : 'white',
                  color: '#1e293b',
                }}
              />
            ))}
          </Animated.View>

          {/* Error message */}
          {otpError && (
            <Text className="text-red-500 text-sm text-center mb-4">
              Invalid code. Please try again.
            </Text>
          )}

          {/* Loading indicator */}
          {isSubmitting && (
            <View className="flex-row items-center justify-center gap-2 mb-4">
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text className="text-primary-600 text-sm font-medium">Verifying...</Text>
            </View>
          )}

          {/* Resend */}
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-slate-400 text-sm">Didn't receive it?</Text>
            {resendCooldown > 0 ? (
              <Text className={`text-sm font-medium ${resendCooldown <= 10 ? 'text-red-500' : 'text-slate-500'}`}>
                Resend in {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isSubmitting}
                className="flex-row items-center gap-1"
                style={{ opacity: isSubmitting ? 0.5 : 1 }}
              >
                <RefreshCw size={14} color="#4f46e5" />
                <Text className="text-primary-600 font-semibold text-sm">
                  Resend Code
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Expiry notice */}
          <Text className="text-xs text-slate-400 text-center mt-6">
            ⏱️ Code expires in 10 minutes
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
