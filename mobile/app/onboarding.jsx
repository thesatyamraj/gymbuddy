import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Dumbbell, Heart, MessageCircle, ArrowRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Find Gym Buddies',
    description:
      'Discover fitness enthusiasts nearby who share your workout style, gym, and schedule.',
    icon: Dumbbell,
    color: '#4f46e5',
    bgColor: '#eef2ff',
  },
  {
    id: '2',
    title: 'Swipe to Match',
    description:
      'Swipe right to like, left to pass. When you both like each other, it\'s a match!',
    icon: Heart,
    color: '#f43f5e',
    bgColor: '#fff1f2',
  },
  {
    id: '3',
    title: 'Start Training Together',
    description:
      'Chat in real-time, coordinate your schedules, and hit the gym together.',
    icon: MessageCircle,
    color: '#10b981',
    bgColor: '#ecfdf5',
  },
];

/**
 * 3-slide onboarding screen — shown once via AsyncStorage flag
 */
export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/login');
  };

  const renderSlide = ({ item }) => (
    <View
      className="items-center justify-center px-8"
      style={{ width: SCREEN_WIDTH }}
    >
      <View
        className="w-32 h-32 rounded-3xl items-center justify-center mb-10"
        style={{ backgroundColor: item.bgColor }}
      >
        <item.icon size={56} color={item.color} />
      </View>

      <Text className="text-3xl font-black text-slate-900 text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-base text-slate-500 text-center leading-6 max-w-[300px]">
        {item.description}
      </Text>
    </View>
  );

  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="flex-row justify-end pt-16 px-6">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-primary-600 font-semibold text-sm">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setCurrentSlide(index);
          }}
        />
      </View>

      {/* Dots + Button */}
      <View className="items-center pb-12 px-6">
        {/* Dot Indicators */}
        <View className="flex-row gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === currentSlide ? 'w-8 bg-primary-600' : 'w-2 bg-slate-200'
              }`}
              style={{ height: 8 }}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={isLast ? handleGetStarted : handleNext}
          className="w-full py-4 bg-primary-600 rounded-2xl flex-row items-center justify-center gap-2"
          style={{
            shadowColor: '#4f46e5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-white font-bold text-base">
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
