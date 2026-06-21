import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, ChevronUp } from 'lucide-react-native';
import { useMatchStore } from '../../../store/matchStore';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';
import MessageBubble from '../../../components/MessageBubble';
import TypingIndicator from '../../../components/TypingIndicator';
import OnlineBadge from '../../../components/OnlineBadge';
import { Colors } from '../../../lib/theme';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * Individual chat screen — real-time messaging with typing indicator
 * Uses inverted FlatList for proper bottom-anchored message display
 */
export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const router = useRouter();

  const { matches, fetchMatches } = useMatchStore();
  const {
    messages,
    isLoading,
    hasMore,
    nextCursor,
    fetchMessages,
    sendMessage,
    addMessage,
    markAsRead,
    clearMessages,
    setActiveMatch,
  } = useChatStore();
  const { user, accessToken } = useAuthStore();
  const { onlineUsers } = useOnlineUsers();

  const match = matches.find((m) => m._id === matchId);
  const otherUser =
    match?.otherUser || match?.users?.find((u) => u._id !== user?._id);
  const isOtherOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  // Fetch matches if not loaded (e.g., deep link into chat)
  useEffect(() => {
    if (matches.length === 0) {
      fetchMatches();
    }
  }, []);

  // Connect socket and join room
  useEffect(() => {
    if (!accessToken || !matchId) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join_match', matchId);

    socket.on('new_message', (message) => {
      if (message.matchId === matchId) {
        addMessage(message);
      }
    });

    socket.on('user_typing', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.emit('leave_match', matchId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, matchId]);

  // Fetch messages
  useEffect(() => {
    if (matchId) {
      setActiveMatch(matchId);
      clearMessages();
      fetchMessages(matchId);
      markAsRead(matchId);
    }

    return () => {
      setActiveMatch(null);
      clearMessages();
    };
  }, [matchId]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setIsSending(true);

    // Stop typing
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { matchId });
    }

    try {
      await sendMessage(matchId, content);
    } catch (error) {
      setMessageText(content); // Restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);

    if (!socketRef.current || !matchId) return;

    socketRef.current.emit('typing', { matchId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { matchId });
    }, 2000);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchMessages(matchId, nextCursor);
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble
      message={item}
      isOwn={
        item.senderId?._id === user?._id || item.senderId === user?._id
      }
    />
  );

  // Inverted FlatList: footer = top of screen (load more), header = bottom (typing)
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        onPress={handleLoadMore}
        disabled={isLoading}
        style={{ alignItems: 'center', paddingVertical: 12 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ChevronUp size={14} color={Colors.primary} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.primary }}>
              Load older messages
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!isTyping) return null;
    return <TypingIndicator />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: Colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 6, borderRadius: 8 }}
          >
            <ArrowLeft size={22} color={Colors.textBody} />
          </TouchableOpacity>

          <View style={{ position: 'relative' }}>
            {otherUser?.profilePhoto ? (
              <Image
                source={{ uri: otherUser.profilePhoto }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.primarySurface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary }}>
                  {otherUser?.name?.charAt(0)}
                </Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: -2, right: -2 }}>
              <OnlineBadge isOnline={isOtherOnline} size="sm" />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary }}
              numberOfLines={1}
            >
              {otherUser?.name}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.iconFaint }}>
              {isTyping ? 'typing...' : isOtherOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {isLoading && messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: Colors.primarySurface,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Send size={28} color={Colors.primary300} />
            </View>
            <Text style={{ color: Colors.textMuted, fontSize: 14, textAlign: 'center' }}>
              No messages yet. Say hello! 👋
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            inverted
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
          />
        )}

        {/* Message Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}
        >
          <TextInput
            value={messageText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={Colors.iconFaint}
            maxLength={2000}
            multiline
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.bg,
              fontSize: 14,
              maxHeight: 96,
              color: Colors.textSecondary,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || isSending}
            style={{
              width: 48,
              height: 48,
              backgroundColor: Colors.primary,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !messageText.trim() || isSending ? 0.5 : 1,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
