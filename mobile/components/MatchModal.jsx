import { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MessageCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Full-screen match celebration modal with animated photos and confetti
 */
export default function MatchModal({ isOpen, onClose, match, currentUser }) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const leftPhotoAnim = useRef(new Animated.Value(-100)).current;
  const rightPhotoAnim = useRef(new Animated.Value(100)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  const confettiAnims = useRef(
    Array.from({ length: 30 }, () => ({
      translateY: new Animated.Value(-20),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const otherUser = useMemo(() => {
    if (!match || !currentUser) return null;
    return match.users?.find((u) => u._id !== currentUser._id);
  }, [match, currentUser]);

  const confettiColors = [
    '#6366f1', '#ec4899', '#f43f5e', '#eab308', '#22c55e',
    '#3b82f6', '#a855f7', '#f97316',
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset
      scaleAnim.setValue(0);
      leftPhotoAnim.setValue(-100);
      rightPhotoAnim.setValue(100);
      textOpacity.setValue(0);
      buttonsOpacity.setValue(0);

      // Animate in sequence
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(leftPhotoAnim, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(rightPhotoAnim, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animations
      confettiAnims.forEach((anim, i) => {
        anim.translateY.setValue(-20);
        anim.translateX.setValue(0);
        anim.opacity.setValue(1);
        anim.rotate.setValue(0);

        const duration = 2000 + Math.random() * 2000;
        const delay = Math.random() * 1500;

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: SCREEN_HEIGHT + 50,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 720,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [isOpen]);

  if (!isOpen || !otherUser) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        {/* Confetti */}
        {confettiAnims.map((anim, i) => {
          // Pre-compute static random values for this confetti piece
          const staticLeft = Math.random() * SCREEN_WIDTH;
          const size = 8 + Math.random() * 6;
          const isRound = Math.random() > 0.5;

          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: staticLeft,
                width: size,
                height: size,
                backgroundColor: confettiColors[i % confettiColors.length],
                borderRadius: isRound ? 50 : 2,
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 720],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
              }}
            />
          );
        })}

        <Animated.View
          className="bg-white rounded-3xl p-8 mx-6"
          style={{
            width: SCREEN_WIDTH - 48,
            maxWidth: 400,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-50"
            style={{ zIndex: 10 }}
          >
            <X size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Photos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <Animated.View
              style={{ transform: [{ translateX: leftPhotoAnim }] }}
            >
              {currentUser?.profilePhoto && currentUser.profilePhoto.length > 0 ? (
                <Image
                  source={{ uri: currentUser.profilePhoto }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: '#e0e7ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                >
                  <Text style={{ fontSize: 36, fontWeight: '700', color: '#4f46e5' }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </Animated.View>

            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#f43f5e',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>❤️</Text>
            </View>

            <Animated.View
              style={{ transform: [{ translateX: rightPhotoAnim }] }}
            >
              {otherUser?.profilePhoto && otherUser.profilePhoto.length > 0 ? (
                <Image
                  source={{ uri: otherUser.profilePhoto }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: '#ffe4e6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                >
                  <Text style={{ fontSize: 36, fontWeight: '700', color: '#e11d48' }}>
                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Match Text */}
          <Animated.View style={{ opacity: textOpacity }}>
            <Text className="text-3xl font-black text-center text-primary-600 mb-1">
              It's a Match! 🎉
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              You and {otherUser?.name} both want to train together!
            </Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={{ opacity: buttonsOpacity }} className="gap-3">
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push(`/chat/${match._id}`);
              }}
              className="w-full py-3.5 bg-primary-600 rounded-xl flex-row items-center justify-center gap-2"
              style={{
                shadowColor: '#4f46e5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <MessageCircle size={20} color="white" />
              <Text className="text-white font-semibold text-base">
                Send a Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="w-full py-3.5 bg-slate-100 rounded-xl items-center justify-center"
            >
              <Text className="text-slate-700 font-semibold text-base">
                Keep Swiping
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}
