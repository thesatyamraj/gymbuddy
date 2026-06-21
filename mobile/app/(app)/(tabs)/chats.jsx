import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useMatchStore } from '../../../store/matchStore';
import { useChatStore } from '../../../store/chatStore';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';
import { useAuthStore } from '../../../store/authStore';
import OnlineBadge from '../../../components/OnlineBadge';
import { Colors } from '../../../lib/theme';

/**
 * Chats tab — list of matched users with last message preview and unread badges
 */
export default function ChatsScreen() {
  const { matches, isLoading, fetchMatches } = useMatchStore();
  const { unreadCounts } = useChatStore();
  const { onlineUsers } = useOnlineUsers();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const formatLastMessage = (match) => {
    if (!match.lastMessage) return 'Say hello! 👋';
    const isMine = match.lastMessage.senderId === user?._id;
    const prefix = isMine ? 'You: ' : '';
    const content = match.lastMessage.content;
    return `${prefix}${content.length > 35 ? content.slice(0, 35) + '...' : content}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const renderChatItem = ({ item: match }) => {
    const otherUser =
      match.otherUser || match.users?.find((u) => u._id !== user?._id);
    if (!otherUser) return null;

    const isOnline = onlineUsers.includes(otherUser._id);
    const unread = unreadCounts[match._id] || 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${match._id}`)}
        className="flex-row items-center px-4 py-3 bg-surface border-b border-slate-50"
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={{ position: 'relative', marginRight: 12 }}>
          {otherUser.profilePhoto && otherUser.profilePhoto.length > 0 ? (
            <Image
              source={{ uri: otherUser.profilePhoto }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: Colors.primarySurface2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: Colors.primary,
                }}
              >
                {otherUser.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={{ position: 'absolute', bottom: -2, right: -2 }}>
            <OnlineBadge isOnline={isOnline} size="sm" />
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 mr-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>
              {otherUser.name}
            </Text>
            <Text className="text-[10px] text-slate-400">
              {formatTime(match.lastMessageAt || match.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-0.5">
            <Text className="text-xs text-slate-500 flex-1 mr-2" numberOfLines={1}>
              {formatLastMessage(match)}
            </Text>
            {unread > 0 && (
              <View className="w-5 h-5 bg-primary-600 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {unread > 9 ? '9+' : unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 py-4 border-b border-slate-100">
        <Text className="text-xl font-bold text-slate-800">Messages</Text>
      </View>

      {matches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <MessageCircle size={36} color={Colors.iconFaint} />
          </View>
          <Text className="text-lg font-bold text-slate-700 mb-1">
            Your Messages
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            Match with someone to start chatting!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
