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
          backgroundColor: 'white',
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
                backgroundColor: '#6366f1',
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
            style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}
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
                  backgroundColor: '#f1f5f9',
                }}
              >
                <MapPin size={10} color="#64748b" />
                <Text
                  style={{ color: '#475569', fontSize: 10, fontWeight: '500' }}
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
                  backgroundColor: '#eef2ff',
                }}
              >
                <Dumbbell size={10} color="#4338ca" />
                <Text style={{ color: '#4338ca', fontSize: 10, fontWeight: '500' }}>
                  {otherUser.workoutType}
                </Text>
              </View>
            ) : null}
          </View>

          {otherUser.timing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <Clock size={10} color="#94a3b8" />
              <Text style={{ color: '#94a3b8', fontSize: 10 }}>{otherUser.timing}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
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
              backgroundColor: '#fff1f2',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#ffe4e6',
              marginBottom: 12,
            }}
          >
            <Heart size={16} color="#e11d48" />
            <Text style={{ color: '#e11d48', fontSize: 14, fontWeight: '500' }}>Matches</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>Your Matches</Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </Text>
        </View>

        {matches.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View
              style={{
                width: 96,
                height: 96,
                backgroundColor: '#fff1f2',
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Users size={40} color="#fda4af" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>
              No matches yet
            </Text>
            <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Keep swiping to find your perfect gym partner!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(tabs)')}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: '#4f46e5',
                borderRadius: 16,
                shadowColor: '#4f46e5',
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
