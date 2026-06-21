import { useState, useRef, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  KeyRound,
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { Colors } from '../../../lib/theme';

/**
 * Change Password screen — two-step OTP-verified password change
 * Step 1: Enter current password + new password
 * Step 2: Verify OTP sent to email
 */
export default function ChangePasswordScreen() {
  const { sendPasswordChangeOtp, changePassword, isSubmitting, user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStep1Submit = async () => {
    setError('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await sendPasswordChangeOtp(currentPassword, newPassword);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      // Error handled by store toast
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      await changePassword(otpCode);
      router.back();
    } catch (err) {
      // Error handled by store toast
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      await sendPasswordChangeOtp(currentPassword, newPassword);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      // Error handled by store toast
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 bg-surface border-b border-slate-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1.5 rounded-lg"
          >
            <ArrowLeft size={22} color={Colors.textBody} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">Change Password</Text>
            <Text className="text-xs text-slate-500">
              {step === 1 ? 'Enter your passwords' : 'Verify with OTP'}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 pt-4 gap-4">
            {/* Step Indicator */}
            <View className="flex-row items-center justify-center gap-3 mb-2">
              <View
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${
                  step === 1 ? 'bg-primary-600' : 'bg-primary-100'
                }`}
                style={step === 1 ? {
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                } : {}}
              >
                <KeyRound size={14} color={step === 1 ? 'white' : Colors.primaryDark} />
                <Text
                  className={`text-xs font-medium ${
                    step === 1 ? 'text-white' : 'text-primary-700'
                  }`}
                >
                  Passwords
                </Text>
              </View>
              <View className="w-6 h-px bg-slate-200" />
              <View
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${
                  step === 2 ? 'bg-primary-600' : 'bg-slate-100'
                }`}
                style={step === 2 ? {
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                } : {}}
              >
                <ShieldCheck size={14} color={step === 2 ? 'white' : Colors.iconFaint} />
                <Text
                  className={`text-xs font-medium ${
                    step === 2 ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  Verify OTP
                </Text>
              </View>
            </View>

            {/* Step 1: Password Form */}
            {step === 1 && (
              <View className="bg-surface rounded-3xl p-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Password Details
                </Text>

                <View className="gap-4">
                  {/* Current Password */}
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">
                      Current Password
                    </Text>
                    <View className="relative">
                      <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                        <Lock size={16} color={Colors.iconFaint} />
                      </View>
                      <TextInput
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter current password"
                        placeholderTextColor={Colors.iconFaint}
                      />
                      <TouchableOpacity
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-0 bottom-0 justify-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={16} color={Colors.iconFaint} />
                        ) : (
                          <Eye size={16} color={Colors.iconFaint} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* New Password */}
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">
                      New Password
                    </Text>
                    <View className="relative">
                      <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                        <Lock size={16} color={Colors.iconFaint} />
                      </View>
                      <TextInput
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="At least 6 characters"
                        placeholderTextColor={Colors.iconFaint}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-0 bottom-0 justify-center"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} color={Colors.iconFaint} />
                        ) : (
                          <Eye size={16} color={Colors.iconFaint} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm New Password */}
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">
                      Confirm New Password
                    </Text>
                    <View className="relative">
                      <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                        <Lock size={16} color={Colors.iconFaint} />
                      </View>
                      <TextInput
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Re-enter new password"
                        placeholderTextColor={Colors.iconFaint}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-0 bottom-0 justify-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} color={Colors.iconFaint} />
                        ) : (
                          <Eye size={16} color={Colors.iconFaint} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {error ? (
                    <Text className="text-red-500 text-sm">{error}</Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <View className="bg-surface rounded-3xl p-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="items-center mb-6">
                  <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mb-4">
                    <ShieldCheck size={32} color={Colors.primary} />
                  </View>
                  <Text className="text-lg font-bold text-slate-900 mb-1">
                    Check Your Email
                  </Text>
                  <Text className="text-sm text-slate-500 text-center">
                    We sent a 6-digit code to{'\n'}
                    <Text className="font-semibold">{user?.email}</Text>
                  </Text>
                </View>

                {/* OTP Input */}
                <View className="flex-row justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-surface text-slate-900"
                      style={{ color: Colors.text }}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {error ? (
                  <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
                ) : null}

                {/* Resend */}
                <View className="items-center">
                  {countdown > 0 ? (
                    <Text className="text-sm text-slate-400">
                      Resend code in{' '}
                      <Text className="font-semibold text-primary-600">{countdown}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} disabled={isSubmitting}>
                      <Text className="text-sm text-primary-600 font-medium">
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {step === 1 ? (
              <TouchableOpacity
                onPress={handleStep1Submit}
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-4 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
                style={{
                  opacity: isSubmitting || !currentPassword || !newPassword || !confirmPassword ? 0.5 : 1,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Mail size={18} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {isSubmitting ? 'Verifying...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                  }}
                  className="flex-1 py-4 bg-surface rounded-xl flex-row items-center justify-center gap-2 border border-slate-200"
                >
                  <ArrowLeft size={18} color={Colors.textBody} />
                  <Text className="text-slate-700 font-semibold text-base">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={isSubmitting || otp.join('').length !== 6}
                  className="flex-1 py-4 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
                  style={{
                    opacity: isSubmitting || otp.join('').length !== 6 ? 0.5 : 1,
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <ShieldCheck size={18} color="white" />
                  )}
                  <Text className="text-white font-semibold text-sm">
                    {isSubmitting ? 'Verifying...' : 'Change Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
