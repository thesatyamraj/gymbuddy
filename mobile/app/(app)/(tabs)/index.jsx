import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame } from 'lucide-react-native';
import SwipeStack from '../../../components/SwipeStack';
import MatchModal from '../../../components/MatchModal';
import SkeletonCard from '../../../components/SkeletonCard';
import { useSwipeUsers } from '../../../hooks/useSwipeUsers';
import { useAuthStore } from '../../../store/authStore';
import { useMatchStore } from '../../../store/matchStore';

/**
 * Discover/Swipe tab — main swipe screen
 * Fetches candidates and displays a swipeable card stack
 */
export default function DiscoverScreen() {
  const [matchModalData, setMatchModalData] = useState(null);
  const { users, isLoading, hasMore, fetchUsers } = useSwipeUsers();
  const { user } = useAuthStore();
  const { addMatch } = useMatchStore();

  useEffect(() => {
    fetchUsers(true);
  }, []);

  const handleSwipeComplete = () => {
    if (hasMore) {
      fetchUsers(false);
    }
  };

  const handleMatch = (match) => {
    addMatch(match);
    setMatchModalData(match);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: '#eef2ff',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#e0e7ff',
              marginBottom: 12,
            }}
          >
            <Flame size={16} color="#4338ca" />
            <Text style={{ color: '#4338ca', fontSize: 14, fontWeight: '500' }}>Discover</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>
            Find Your Gym Partner
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Swipe right to like, left to pass
          </Text>
        </View>

        {/* Swipe Area */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {isLoading && users.length === 0 ? (
            <SkeletonCard />
          ) : (
            <SwipeStack
              users={users}
              onSwipeComplete={handleSwipeComplete}
              onMatch={handleMatch}
              isLoading={isLoading}
            />
          )}
        </View>
      </View>

      {/* Match Modal */}
      <MatchModal
        isOpen={!!matchModalData}
        onClose={() => setMatchModalData(null)}
        match={matchModalData}
        currentUser={user}
      />
    </SafeAreaView>
  );
}
