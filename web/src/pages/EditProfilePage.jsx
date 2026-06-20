import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  User,
  Dumbbell,
  MapPin,
  Clock,
  Camera,
  ArrowLeft,
  Save,
  Upload,
  X,
  Loader2,
  Trash2,
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

/**
 * Edit profile page — form to update profile fields and photo
 * Pre-populated with current user data from authStore
 */
export default function EditProfilePage() {
  const { user, updateProfile, uploadPhoto, deletePhoto, isSubmitting } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      gymName: user?.gymName || '',
      workoutType: user?.workoutType || 'Other',
      timing: user?.timing || 'Flexible',
    },
  });

  const bioValue = watch('bio', '');

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

  const removeNewPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteExistingPhoto = async () => {
    setIsDeletingPhoto(true);
    try {
      await deletePhoto();
    } catch (error) {
      // Error handled by store
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleUploadNewPhoto = async () => {
    if (!photoFile) return;
    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(photoFile);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);

      // Upload photo if a new one was selected
      if (photoFile) {
        await handleUploadNewPhoto();
      }

      navigate('/profile');
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
            <p className="text-sm text-slate-500">Update your profile details</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Profile Photo
            </h2>

            <div className="flex items-center gap-6">
              {/* Current/Preview Photo */}
              <div className="relative flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                  />
                ) : user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center shadow-md">
                    <Camera className="w-10 h-10 text-primary-300" />
                  </div>
                )}
              </div>

              {/* Photo Actions */}
              <div className="flex flex-col gap-2">
                {photoPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={handleUploadNewPhoto}
                      disabled={isUploadingPhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={removeNewPhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all ${
                        isDragging
                          ? 'bg-primary-50 text-primary-600 border-2 border-primary-300'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </div>
                    {user?.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleDeleteExistingPhoto}
                        disabled={isDeletingPhoto}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {isDeletingPhoto ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileDrop}
              className="hidden"
            />
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Personal Info
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      maxLength: { value: 50, message: 'Max 50 characters' },
                    })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  {...register('bio', {
                    maxLength: { value: 300, message: 'Max 300 characters' },
                  })}
                  rows={3}
                  placeholder="Tell people about yourself..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
            </div>
          </motion.div>

          {/* Workout Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-card p-6"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Workout Preferences
            </h2>

            <div className="space-y-4">
              {/* Gym Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gym Name
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('gymName', {
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                    type="text"
                    placeholder="e.g. Gold's Gym Downtown"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {errors.gymName && (
                  <p className="text-red-500 text-xs mt-1">{errors.gymName.message}</p>
                )}
              </div>

              {/* Workout Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Workout Type
                </label>
                <div className="relative">
                  <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    {...register('workoutType')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {WORKOUT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Preferred Timing
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    {...register('timing')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {TIMING_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
