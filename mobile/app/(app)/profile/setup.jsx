import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  Dumbbell,
  Clock,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Upload,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
 * Step 3: Photo upload via Image Picker
 */
export default function ProfileSetupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoUri, setPhotoUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { user, updateProfile, uploadPhoto } = useAuthStore();

  const {
    control,
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

  const pickImage = async () => {
    // Request permission first to avoid silent failure on first attempt
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

  const removePhoto = () => {
    setPhotoUri(null);
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

      if (photoUri) {
        await uploadPhoto(photoUri);
      }

      Toast.show({ type: 'success', text1: "Profile complete! Let's find your gym buddy! 🎉" });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to save profile. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const renderPickerChips = (options, currentValue, onChange) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          className={`px-3 py-2.5 rounded-xl border ${
            currentValue === option
              ? 'bg-primary-600 border-primary-600'
              : 'bg-white border-slate-200'
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-14 h-14 bg-primary-600 rounded-2xl items-center justify-center mb-4"
                style={{
                  shadowColor: '#4f46e5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Dumbbell size={28} color="white" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mb-1">
                Set Up Your Profile
              </Text>
              <Text className="text-slate-500 text-sm">
                Step {currentStep} of 3 — {STEPS[currentStep - 1].title}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="flex-row gap-2 mb-6">
              {STEPS.map((step) => (
                <View
                  key={step.id}
                  className={`flex-1 h-1.5 rounded-full ${
                    step.id <= currentStep ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </View>

            {/* Form Card */}
            <View className="bg-white rounded-3xl p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Step 1: Name + Bio */}
              {currentStep === 1 && (
                <View className="gap-5">
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">
                      Your Name
                    </Text>
                    <View className="relative">
                      <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                        <User size={16} color="#94a3b8" />
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
                            placeholder="Your full name"
                            placeholderTextColor="#94a3b8"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="words"
                          />
                        )}
                      />
                    </View>
                    {errors.name && (
                      <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
                    )}
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">Bio</Text>
                    <Controller
                      control={control}
                      name="bio"
                      rules={{ maxLength: { value: 300, message: 'Max 300 characters' } }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
                          multiline
                          numberOfLines={4}
                          placeholder="Tell potential gym partners about yourself..."
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          textAlignVertical="top"
                          style={{ minHeight: 100 }}
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
              )}

              {/* Step 2: Workout Preferences */}
              {currentStep === 2 && (
                <View className="gap-5">
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">Gym Name</Text>
                    <View className="relative">
                      <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                        <MapPin size={16} color="#94a3b8" />
                      </View>
                      <Controller
                        control={control}
                        name="gymName"
                        rules={{
                          required: 'Gym name is required',
                          maxLength: { value: 100, message: 'Max 100 characters' },
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
                            placeholder="e.g. Gold's Gym Downtown"
                            placeholderTextColor="#94a3b8"
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

                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-2">Workout Type</Text>
                    <Controller
                      control={control}
                      name="workoutType"
                      render={({ field: { onChange, value } }) =>
                        renderPickerChips(WORKOUT_TYPES, value, onChange)
                      }
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-2">Preferred Timing</Text>
                    <Controller
                      control={control}
                      name="timing"
                      render={({ field: { onChange, value } }) =>
                        renderPickerChips(TIMING_OPTIONS, value, onChange)
                      }
                    />
                  </View>
                </View>
              )}

              {/* Step 3: Photo Upload */}
              {currentStep === 3 && (
                <View className="gap-5">
                  <Text className="text-sm font-medium text-slate-700">Profile Photo</Text>

                  {photoUri ? (
                    <View className="items-center">
                      <View className="relative">
                        <Image
                          source={{ uri: photoUri }}
                          className="w-48 h-48 rounded-3xl"
                          contentFit="cover"
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 5,
                          }}
                        />
                        <TouchableOpacity
                          onPress={removePhoto}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                          style={{
                            shadowColor: '#ef4444',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <X size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={pickImage}
                      className="border-2 border-dashed border-slate-200 rounded-3xl p-12 items-center"
                    >
                      <Upload size={40} color="#94a3b8" />
                      <Text className="text-sm font-medium text-slate-700 mt-3">
                        Tap to choose a photo
                      </Text>
                      <Text className="text-xs text-slate-400 mt-1">
                        JPEG, PNG, or WebP • Max 5MB
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text className="text-xs text-slate-400 text-center">
                    You can skip this and add a photo later
                  </Text>
                </View>
              )}

              {/* Navigation Buttons */}
              <View className="flex-row items-center justify-between mt-8">
                {currentStep > 1 ? (
                  <TouchableOpacity
                    onPress={handleBack}
                    className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl"
                  >
                    <ArrowLeft size={16} color="#64748b" />
                    <Text className="text-slate-600 font-medium text-sm">Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                {currentStep < 3 ? (
                  <TouchableOpacity
                    onPress={handleNext}
                    className="flex-row items-center gap-2 px-6 py-3 bg-primary-600 rounded-xl"
                    style={{
                      shadowColor: '#4f46e5',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-white font-semibold text-sm">Next</Text>
                    <ArrowRight size={16} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isUploading}
                    className="flex-row items-center gap-2 px-6 py-3 bg-primary-600 rounded-xl"
                    style={{
                      opacity: isUploading ? 0.6 : 1,
                      shadowColor: '#4f46e5',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Check size={16} color="white" />
                    )}
                    <Text className="text-white font-semibold text-sm">
                      {isUploading ? 'Saving...' : 'Complete Setup'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
