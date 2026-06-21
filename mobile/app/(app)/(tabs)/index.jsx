import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Sun, Moon, SlidersHorizontal } from 'lucide-react-native';
import * as Location from 'expo-location';
import SwipeStack from '../../../components/SwipeStack';
import MatchModal from '../../../components/MatchModal';
import SkeletonCard from '../../../components/SkeletonCard';
import DiscoverFilters, { DEFAULT_FILTERS, countActiveFilters } from '../../../components/DiscoverFilters';
import { useSwipeUsers } from '../../../hooks/useSwipeUsers';
import { useAuthStore } from '../../../store/authStore';
import { useMatchStore } from '../../../store/matchStore';
import { Colors, useThemeStore } from '../../../lib/theme';
import api from '../../../api/axios';

/**
 * Discover/Swipe tab — main swipe screen with filters + real-time location.
 */
export default function DiscoverScreen() {
  const themeName = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = themeName === 'dark';
  const [matchModalData, setMatchModalData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [locationReady, setLocationReady] = useState(false);
  const { users, isLoading, hasMore, fetchUsers } = useSwipeUsers();
  const { user } = useAuthStore();
  const { addMatch } = useMatchStore();
  const didInit = useRef(false);

  // Capture real-time location once, then load candidates.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          await api.put('/users/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationReady(true);
        }
      } catch {
        /* ignore — distance filter just won't apply */
      } finally {
        fetchUsers(true, filters);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipeComplete = () => {
    if (hasMore) fetchUsers(false);
  };

  const handleMatch = (match) => {
    addMatch(match);
    setMatchModalData(match);
  };

  const applyFilters = (next) => {
    setFilters(next);
    fetchUsers(true, next);
  };

  const activeCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Filters button (top-left) */}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 20,
            height: 40,
            paddingHorizontal: 12,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <SlidersHorizontal size={18} color={Colors.textBody} />
          {activeCount > 0 && (
            <View
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 4,
                borderRadius: 999,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Theme toggle (top-right) */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 20,
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          {isDark ? (
            <Sun size={18} color={Colors.primaryLight} />
          ) : (
            <Moon size={18} color={Colors.textBody} />
          )}
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: Colors.primarySurface,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: Colors.primarySurface2,
              marginBottom: 12,
            }}
          >
            <Flame size={16} color={Colors.primaryDark} />
            <Text style={{ color: Colors.primaryDark, fontSize: 14, fontWeight: '500' }}>Discover</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text }}>
            Find Your Gym Partner
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 14, marginTop: 4 }}>
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

      <DiscoverFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        initial={filters}
        onApply={applyFilters}
        locationReady={locationReady}
      />

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
