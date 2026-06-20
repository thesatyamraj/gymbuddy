import { View, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { MapPin, Dumbbell, Clock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_HORIZONTAL_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

/**
 * Single swipe card built with Reanimated 3 + Gesture Handler
 * Supports pan gesture with rotation interpolation and like/nope overlays
 * cardHeight is passed from SwipeStack (measured via onLayout)
 */
export default function SwipeCard({ user, onSwipe, isTop, style, cardHeight }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 15 });
        runOnJS(onSwipe)('like');
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 15 });
        runOnJS(onSwipe)('pass');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-25, 0, 25]
    );

    return {
      transform: [
        { translateX: isTop ? translateX.value : 0 },
        { translateY: isTop ? translateY.value : 0 },
        { rotate: isTop ? `${rotate}deg` : '0deg' },
        { scale: style?.scale || 1 },
      ],
    };
  });

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(translateX.value, [0, SCREEN_WIDTH * 0.3], [0, 1])
      : 0,
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(translateX.value, [-SCREEN_WIDTH * 0.3, 0], [1, 0])
      : 0,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          cardAnimatedStyle,
          {
            position: 'absolute',
            width: CARD_WIDTH,
            left: 0,
            zIndex: style?.zIndex || 0,
            top: style?.translateY || 0,
          },
        ]}
      >
        <View
          style={{
            width: CARD_WIDTH,
            height: cardHeight,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 10,
          }}
        >
          {/* User Photo */}
          {user.profilePhoto && user.profilePhoto.length > 0 ? (
            <Image
              source={{ uri: user.profilePhoto }}
              style={{ width: CARD_WIDTH, height: cardHeight }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={{
                width: CARD_WIDTH,
                height: cardHeight,
                backgroundColor: '#4f46e5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 96,
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: '700',
                }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <View style={{ flex: 1 }} />
            <View
              style={{
                height: cardHeight * 0.4,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            />
          </View>

          {/* Like Overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(34,197,94,0.2)',
              },
              likeOverlayStyle,
            ]}
          >
            <View
              style={{
                borderWidth: 4,
                borderColor: '#4ade80',
                borderRadius: 16,
                paddingHorizontal: 24,
                paddingVertical: 8,
                transform: [{ rotate: '-20deg' }],
              }}
            >
              <Text
                style={{
                  color: '#4ade80',
                  fontSize: 30,
                  fontWeight: '900',
                  letterSpacing: 2,
                }}
              >
                LIKE
              </Text>
            </View>
          </Animated.View>

          {/* Nope Overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(239,68,68,0.2)',
              },
              nopeOverlayStyle,
            ]}
          >
            <View
              style={{
                borderWidth: 4,
                borderColor: '#f87171',
                borderRadius: 16,
                paddingHorizontal: 24,
                paddingVertical: 8,
                transform: [{ rotate: '20deg' }],
              }}
            >
              <Text
                style={{
                  color: '#f87171',
                  fontSize: 30,
                  fontWeight: '900',
                  letterSpacing: 2,
                }}
              >
                NOPE
              </Text>
            </View>
          </Animated.View>

          {/* User Info */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: 'white',
                marginBottom: 8,
              }}
            >
              {user.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 8,
              }}
            >
              {user.gymName ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <MapPin size={12} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                    {user.gymName}
                  </Text>
                </View>
              ) : null}
              {user.workoutType ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Dumbbell size={12} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                    {user.workoutType}
                  </Text>
                </View>
              ) : null}
              {user.timing ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Clock size={12} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                    {user.timing}
                  </Text>
                </View>
              ) : null}
            </View>

            {user.bio ? (
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14,
                }}
                numberOfLines={2}
              >
                {user.bio}
              </Text>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
