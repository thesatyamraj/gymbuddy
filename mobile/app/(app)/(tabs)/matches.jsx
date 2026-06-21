import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Dumbbell, Clock, Users } from 'lucide-react-native';
import { useMatchStore } from '../../../store/matchStore';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';
import { useAuthStore } from '../../../store/authStore';
import OnlineBadge from '../../../components/OnlineBadge';
import { Colors } from '../../../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

/**
 * Matches tab — grid of matched users with online status
 */
export default function MatchesScreen() {
  const { matches, isLoading, fetchMatches, clearNewMatchCount } = useMatchStore();
  const { onlineUsers } = useOnlineUsers();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
    clearNewMatchCount();
  }, []);

  const handleOpenChat = (match) => {
    router.push(`/chat/${match._id}`);
  };

  const renderMatchCard = ({ item: match, index }) => {
    const otherUser =
      match.otherUser || match.users?.find((u) => u._id !== user?._id);
    if (!otherUser) return null;

    const isOnline = onlineUsers.includes(otherUser._id);

    return (
      <TouchableOpacity
        onPress={() => handleOpenChat(match)}
        activeOpacity={0.85}
        style={{
          width: CARD_WIDTH,
          marginBottom: CARD_GAP,
          backgroundColor: Colors.surface,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Photo */}
        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH, position: 'relative' }}>
          {otherUser.profilePhoto ? (
            <Image
              source={{ uri: otherUser.profilePhoto }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: Colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: '700',
                }}
              >
                {otherUser.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Online Badge */}
          <View style={{ position: 'absolute', top: 12, right: 12 }}>
            <OnlineBadge isOnline={isOnline} size="md" />
          </View>
        </View>

        {/* Info */}
        <View style={{ padding: 12 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary }}
            numberOfLines={1}
          >
            {otherUser.name}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {otherUser.gymName ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: Colors.sunken,
                }}
              >
                <MapPin size={10} color={Colors.textMuted} />
                <Text
                  style={{ color: Colors.textBody, fontSize: 10, fontWeight: '500' }}
                  numberOfLines={1}
                >
                  {otherUser.gymName.length > 12
                    ? otherUser.gymName.slice(0, 12) + '...'
                    : otherUser.gymName}
                </Text>
              </View>
            ) : null}
            {otherUser.workoutType ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: Colors.primarySurface,
                }}
              >
                <Dumbbell size={10} color={Colors.primaryDark} />
                <Text style={{ color: Colors.primaryDark, fontSize: 10, fontWeight: '500' }}>
                  {otherUser.workoutType}
                </Text>
              </View>
            ) : null}
          </View>

          {otherUser.timing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <Clock size={10} color={Colors.iconFaint} />
              <Text style={{ color: Colors.iconFaint, fontSize: 10 }}>{otherUser.timing}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: Colors.roseSurface,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: Colors.roseSurface2,
              marginBottom: 12,
            }}
          >
            <Heart size={16} color="#e11d48" />
            <Text style={{ color: '#e11d48', fontSize: 14, fontWeight: '500' }}>Matches</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text }}>Your Matches</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 14, marginTop: 4 }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </Text>
        </View>

        {matches.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View
              style={{
                width: 96,
                height: 96,
                backgroundColor: Colors.roseSurface,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Users size={40} color="#fda4af" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>
              No matches yet
            </Text>
            <Text style={{ color: Colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
              Keep swiping to find your perfect gym partner!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)')}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: Colors.primary,
                borderRadius: 16,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Start Swiping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatchCard}
            keyExtractor={(item) => item._id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            columnWrapperStyle={{ justifyContent: 'center', gap: CARD_GAP }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
