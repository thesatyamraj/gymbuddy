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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  MapPin,
  Dumbbell,
  Clock,
  Trash2,
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../lib/theme';

const WORKOUT_TYPES = [
  'Weightlifting', 'Cardio', 'CrossFit', 'Yoga', 'Calisthenics',
  'HIIT', 'Powerlifting', 'Swimming', 'Boxing', 'Other',
];

const TIMING_OPTIONS = [
  'Early Morning (5-7am)', 'Morning (7-10am)', 'Afternoon (12-3pm)',
  'Evening (5-8pm)', 'Night (8pm+)', 'Flexible',
];

/**
 * Edit profile screen — form to update profile fields and photo
 */
export default function EditProfileScreen() {
  const { user, updateProfile, uploadPhoto, deletePhoto, isSubmitting } =
    useAuthStore();
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const {
    control,
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission needed',
        text2: 'Please allow photo access to upload a profile picture.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleDeletePhoto = async () => {
    setIsDeletingPhoto(true);
    try {
      await deletePhoto();
    } catch (error) {
      // Error handled by store
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);

      if (photoUri) {
        setIsUploadingPhoto(true);
        await uploadPhoto(photoUri);
        setPhotoUri(null);
        setIsUploadingPhoto(false);
      }

      router.back();
    } catch (error) {
      setIsUploadingPhoto(false);
    }
  };

  const renderPickerOptions = (options, currentValue, onChange) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          className={`px-3 py-2 rounded-xl border ${
            currentValue === option
              ? 'bg-primary-600 border-primary-600'
              : 'bg-surface border-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              currentValue === option ? 'text-white' : 'text-slate-600'
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            <Text className="text-lg font-bold text-slate-900">Edit Profile</Text>
            <Text className="text-xs text-slate-500">Update your details</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 pt-4 gap-4">
            {/* Photo Section */}
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
                Profile Photo
              </Text>

              <View className="flex-row items-center gap-4">
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    className="w-24 h-24 rounded-2xl"
                    contentFit="cover"
                  />
                ) : user?.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto }}
                    className="w-24 h-24 rounded-2xl"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-2xl bg-primary-100 items-center justify-center">
                    <Camera size={32} color={Colors.primary300} />
                  </View>
                )}

                <View className="gap-2">
                  <TouchableOpacity
                    onPress={pickImage}
                    className="flex-row items-center gap-2 px-4 py-2 bg-primary-600 rounded-xl"
                  >
                    <Camera size={16} color="white" />
                    <Text className="text-white text-sm font-medium">Change</Text>
                  </TouchableOpacity>
                  {user?.profilePhoto && !photoUri && (
                    <TouchableOpacity
                      onPress={handleDeletePhoto}
                      disabled={isDeletingPhoto}
                      className="flex-row items-center gap-2 px-4 py-2 bg-red-50 rounded-xl"
                    >
                      {isDeletingPhoto ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <Trash2 size={16} color="#ef4444" />
                      )}
                      <Text className="text-red-500 text-sm font-medium">Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Personal Info */}
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
                Personal Info
              </Text>

              <View className="gap-4">
                {/* Name */}
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-1.5">Name</Text>
                  <View className="relative">
                    <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                      <User size={16} color={Colors.iconFaint} />
                    </View>
                    <Controller
                      control={control}
                      name="name"
                      rules={{
                        required: 'Name is required',
                        maxLength: { value: 50, message: 'Max 50 characters' },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.name && (
                    <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
                  )}
                </View>

                {/* Bio */}
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-1.5">Bio</Text>
                  <Controller
                    control={control}
                    name="bio"
                    rules={{ maxLength: { value: 300, message: 'Max 300 characters' } }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                        multiline
                        numberOfLines={3}
                        placeholder="Tell people about yourself..."
                        placeholderTextColor={Colors.iconFaint}
                        value={value}
                        onChangeText={onChange}
                        textAlignVertical="top"
                        style={{ minHeight: 80 }}
                      />
                    )}
                  />
                  <View className="flex-row justify-between mt-1">
                    {errors.bio && (
                      <Text className="text-red-500 text-xs">{errors.bio.message}</Text>
                    )}
                    <Text className="text-xs text-slate-400 ml-auto">
                      {bioValue.length}/300
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Workout Preferences */}
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
                Workout Preferences
              </Text>

              <View className="gap-4">
                {/* Gym Name */}
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-1.5">Gym Name</Text>
                  <View className="relative">
                    <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                      <MapPin size={16} color={Colors.iconFaint} />
                    </View>
                    <Controller
                      control={control}
                      name="gymName"
                      rules={{ maxLength: { value: 100, message: 'Max 100 characters' } }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-surface text-sm text-slate-900"
                          placeholder="e.g. Gold's Gym Downtown"
                          placeholderTextColor={Colors.iconFaint}
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.gymName && (
                    <Text className="text-red-500 text-xs mt-1">{errors.gymName.message}</Text>
                  )}
                </View>

                {/* Workout Type */}
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-2">Workout Type</Text>
                  <Controller
                    control={control}
                    name="workoutType"
                    render={({ field: { onChange, value } }) =>
                      renderPickerOptions(WORKOUT_TYPES, value, onChange)
                    }
                  />
                </View>

                {/* Timing */}
                <View>
                  <Text className="text-sm font-medium text-slate-700 mb-2">Preferred Timing</Text>
                  <Controller
                    control={control}
                    name="timing"
                    render={({ field: { onChange, value } }) =>
                      renderPickerOptions(TIMING_OPTIONS, value, onChange)
                    }
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isUploadingPhoto}
              className="w-full py-4 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
              style={{
                opacity: isSubmitting || isUploadingPhoto ? 0.6 : 1,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {isSubmitting || isUploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Save size={18} color="white" />
              )}
              <Text className="text-white font-semibold text-base">
                {isSubmitting || isUploadingPhoto ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
