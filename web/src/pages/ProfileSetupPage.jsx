import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Dumbbell,
  Clock,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  X,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const WORKOUT_TYPES = [
  'Weightlifting', 'Cardio', 'CrossFit', 'Yoga', 'Calisthenics',
  'HIIT', 'Powerlifting', 'Swimming', 'Boxing', 'Other',
];

const TIMING_OPTIONS = [
  'Early Morning (5-7am)', 'Morning (7-10am)', 'Afternoon (12-3pm)',
  'Evening (5-8pm)', 'Night (8pm+)', 'Flexible',
];

const STEPS = [
  { id: 1, title: 'About You', icon: User },
  { id: 2, title: 'Workout Preferences', icon: Dumbbell },
  { id: 3, title: 'Profile Photo', icon: Camera },
];

/**
 * Multi-step profile setup wizard (3 steps)
 * Step 1: Name + Bio
 * Step 2: Gym Name + Workout Type + Timing
 * Step 3: Photo upload with drag & drop
 */
export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user, updateProfile, uploadPhoto } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: '',
      gymName: '',
      workoutType: 'Other',
      timing: 'Flexible',
    },
  });

  const bioValue = watch('bio', '');

  const handleNext = async () => {
    const fieldsToValidate =
      currentStep === 1 ? ['name', 'bio'] : ['gymName', 'workoutType', 'timing'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      await updateProfile({
        name: data.name,
        bio: data.bio,
        gymName: data.gymName,
        workoutType: data.workoutType,
        timing: data.timing,
      });

      if (photoFile) {
        await uploadPhoto(photoFile);
      }

      toast.success('Profile complete! Let\'s find your gym buddy! 🎉');
      navigate('/discover');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display uppercase tracking-wide text-3xl font-bold text-slate-900 mb-1">
            Set Up Your Profile
          </h1>
          <p className="text-slate-500 text-sm">
            Step {currentStep} of 3 — {STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                step.id <= currentStep ? 'bg-primary-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-surface ring-1 ring-slate-200 rounded-3xl shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Name + Bio */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('name', {
                          required: 'Name is required',
                          maxLength: { value: 50, message: 'Max 50 characters' },
                        })}
                        type="text"
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      {...register('bio', {
                        maxLength: { value: 300, message: 'Max 300 characters' },
                      })}
                      rows={4}
                      placeholder="Tell potential gym partners about yourself, your fitness goals, experience level..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      {errors.bio && (
                        <p className="text-red-500 text-xs">{errors.bio.message}</p>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {bioValue.length}/300
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Workout Preferences */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Gym Name
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('gymName', {
                          required: 'Gym name is required',
                          maxLength: { value: 100, message: 'Max 100 characters' },
                        })}
                        type="text"
                        placeholder="e.g. Gold's Gym Downtown"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {errors.gymName && (
                      <p className="text-red-500 text-xs mt-1">{errors.gymName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Workout Type
                    </label>
                    <div className="relative">
                      <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        {...register('workoutType')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {WORKOUT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Preferred Timing
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        {...register('timing')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface ring-1 ring-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {TIMING_OPTIONS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Photo Upload */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Profile Photo
                    </label>

                    {photoPreview ? (
                      <div className="relative w-48 h-48 mx-auto">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-3xl shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }`}
                      >
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Drag & drop your photo here
                        </p>
                        <p className="text-xs text-slate-400 mb-4">
                          JPEG, PNG, or WebP • Max 5MB
                        </p>
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                          <Camera className="w-4 h-4" />
                          Choose Photo
                        </span>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileDrop}
                      className="hidden"
                    />

                    <p className="text-xs text-slate-400 text-center mt-3">
                      You can skip this and add a photo later
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-600/30 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
