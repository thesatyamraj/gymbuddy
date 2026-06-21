import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Dumbbell,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Two-step signup page:
 * Step 1: Name + Email + Password form
 * Step 2: 6-digit OTP verification
 */
export default function SignupPage() {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [showPassword, setShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const { sendOtp, verifyOtp, resendOtp, isSubmitting } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
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
    newValues[index] = value.slice(-1); // Take last char only
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

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;

    const newValues = [...otpValues];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newValues[i] = char;
    });
    setOtpValues(newValues);
    setOtpError(false);

    // Focus on last filled input or the next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();

    // Auto-submit if all 6 digits
    if (newValues.every((v) => v !== '')) {
      handleVerifyOtp(newValues.join(''));
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(
    async (otpString) => {
      if (isSubmitting) return;
      try {
        await verifyOtp({ email: signupEmail, otp: otpString });
        navigate('/profile/setup');
      } catch (error) {
        setOtpError(true);
        setOtpValues(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    },
    [signupEmail, verifyOtp, navigate, isSubmitting]
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

  return (
    <div className="min-h-screen flex relative">
      <ThemeToggle variant="ghost" className="absolute top-4 right-5 z-20" />
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 brand-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20"
          >
            <Dumbbell className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display uppercase tracking-tight text-5xl font-bold mb-4"
          >
            Join GymBuddy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-lg max-w-md"
          >
            Create your account and start finding the perfect workout partner today.
          </motion.p>

          {/* Step indicators on branding panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 mt-10"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              step === 1 ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-white/50'
            }`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <User className="w-4 h-4" />}
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              step === 2 ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-white/50'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Verify</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form / OTP */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="flex items-center gap-2 mb-8 lg:hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">Gym<span className="text-primary-500">Buddy</span></span>
              </div>

              {/* Step indicator (mobile) */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
                  Your Details
                </div>
                <div className="w-6 h-px bg-slate-200" />
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded-full">
                  <span className="w-5 h-5 bg-slate-300 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
                  Verify Email
                </div>
              </div>

              <h2 className="font-display uppercase tracking-wide text-3xl font-bold text-slate-900 mb-1">Create Account</h2>
              <p className="text-slate-500 mb-8">Start your fitness journey with a partner</p>

              <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        maxLength: { value: 50, message: 'Name must be under 50 characters' },
                      })}
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'At least 6 characters' },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ripple"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Continue & Verify Email
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                  Log In
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md text-center"
            >
              {/* Back button */}
              <button
                onClick={() => {
                  setStep(1);
                  setOtpValues(['', '', '', '', '', '']);
                  setOtpError(false);
                }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to details
              </button>

              {/* OTP Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-100"
              >
                <ShieldCheck className="w-8 h-8 text-primary-600" />
              </motion.div>

              <h2 className="font-display uppercase tracking-wide text-3xl font-bold text-slate-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-slate-500 mb-2">
                We sent a 6-digit code to
              </p>
              <p className="text-primary-600 font-semibold mb-8">
                {signupEmail}
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`otp-input ${value ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {otpError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-500 text-sm mb-4"
                  >
                    Invalid code. Please try again.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Loading indicator */}
              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Verifying...</span>
                </div>
              )}

              {/* Resend */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-400">Didn't receive it?</span>
                {resendCooldown > 0 ? (
                  <span className={`font-medium ${resendCooldown <= 10 ? 'countdown-warning' : 'text-slate-500'}`}>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Code
                  </button>
                )}
              </div>

              {/* Expiry notice */}
              <p className="text-xs text-slate-400 mt-6">
                ⏱️ Code expires in 10 minutes
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
