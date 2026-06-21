import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Heart, X, RefreshCw } from 'lucide-react-native';
import SwipeCard from './SwipeCard';
import api from '../api/axios';
import Toast from 'react-native-toast-message';
import { Colors } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

// Fixed height for action buttons row (largest button 60px + vertical padding)
const ACTION_BUTTONS_HEIGHT = 76;

/**
 * Stack of swipe cards with like/pass buttons
 * Shows 3 stacked cards with the top card interactive
 * Uses onLayout to measure available space so cards + buttons always fit on screen
 */
export default function SwipeStack({ users, onSwipeComplete, onMatch, isLoading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const visibleUsers = users.slice(currentIndex, currentIndex + 3);

  // Card height is derived from the measured container minus button area
  const cardHeight = containerHeight > 0
    ? containerHeight - ACTION_BUTTONS_HEIGHT - 20 // 20 for stack offset room
    : 0;

  const handleSwipe = useCallback(
    async (direction) => {
      if (isAnimating || currentIndex >= users.length) return;

      setIsAnimating(true);
      const user = users[currentIndex];

      try {
        if (direction === 'like') {
          const response = await api.post(`/swipe/like/${user._id}`);
          if (response.data.data.isMatch) {
            onMatch(response.data.data.match);
          }
        } else {
          await api.post(`/swipe/pass/${user._id}`);
        }
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Action failed. Try again.' });
      }

      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);

      // Trigger load more when running low
      if (currentIndex + 3 >= users.length) {
        onSwipeComplete();
      }
    },
    [currentIndex, users, isAnimating, onMatch, onSwipeComplete]
  );

  if (isLoading && users.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textMuted, marginTop: 16, fontWeight: '500' }}>
          Finding gym buddies...
        </Text>
      </View>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View
          style={{
            width: 96,
            height: 96,
            backgroundColor: Colors.sunken,
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <RefreshCw size={40} color={Colors.iconFaint} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>
          No more profiles
        </Text>
        <Text style={{ color: Colors.textMuted, textAlign: 'center', maxWidth: 280 }}>
          You've seen everyone for now. Check back later for new gym buddies!
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, width: '100%', alignItems: 'center' }}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {/* Card Stack — takes all space above buttons */}
      {cardHeight > 0 && (
        <View
          style={{
            flex: 1,
            width: CARD_WIDTH,
            alignItems: 'center',
          }}
        >
          {visibleUsers.map((user, index) => {
            const isTop = index === 0;
            const scale = 1 - index * 0.05;
            const translateY = index * 10;

            return (
              <SwipeCard
                key={user._id}
                user={user}
                isTop={isTop}
                onSwipe={handleSwipe}
                cardHeight={cardHeight}
                style={{
                  scale,
                  translateY,
                  zIndex: 3 - index,
                }}
              />
            );
          })}
        </View>
      )}

      {/* Action Buttons — fixed at bottom */}
      <View
        style={{
          height: ACTION_BUTTONS_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => handleSwipe('pass')}
          disabled={isAnimating || currentIndex >= users.length}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          <X size={24} color={Colors.iconFaint} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSwipe('like')}
          disabled={isAnimating || currentIndex >= users.length}
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f43f5e',
            shadowColor: '#f43f5e',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          <Heart size={32} color="white" fill="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
