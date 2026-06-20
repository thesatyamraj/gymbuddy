import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

/**
 * Skeleton loading card with shimmer animation
 */
export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      className="w-full rounded-3xl overflow-hidden bg-white"
      style={{
        aspectRatio: 3 / 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <Animated.View
        className="w-full h-full bg-slate-200"
        style={{ opacity }}
      />
      <View className="absolute bottom-0 left-0 right-0 p-5 gap-3">
        <Animated.View
          className="h-6 w-32 bg-slate-300 rounded-lg"
          style={{ opacity }}
        />
        <View className="flex-row gap-2">
          <Animated.View
            className="h-6 w-20 bg-slate-300 rounded-full"
            style={{ opacity }}
          />
          <Animated.View
            className="h-6 w-24 bg-slate-300 rounded-full"
            style={{ opacity }}
          />
        </View>
        <Animated.View
          className="h-4 w-full bg-slate-300 rounded-lg"
          style={{ opacity }}
        />
      </View>
    </View>
  );
}
