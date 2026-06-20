import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import { useChatStore } from '../store/chatStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * Socket.io connection hook for mobile
 * Manages connection lifecycle, event listeners, and real-time notifications
 * Shows toast notifications for new matches and incoming messages
 * @returns {{ socket: import('socket.io-client').Socket | null }}
 */
export function useSocket() {
  const socketRef = useRef(null);
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const { addMatch } = useMatchStore();
  const { addMessage, incrementUnread, fetchUnreadCounts } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected (mobile)');
      fetchUnreadCounts();
    });

    socket.on('new_match', (match) => {
      addMatch(match);

      // Show match notification toast
      const otherUser = match.users?.find((u) => u._id !== user?._id);
      const matchName = otherUser?.name || 'Someone';
      Toast.show({
        type: 'success',
        text1: '🎉 New Match!',
        text2: `You and ${matchName} are gym buddies!`,
        visibilityTime: 5000,
        position: 'top',
        topOffset: 60,
      });
    });

    socket.on('new_message', (message) => {
      addMessage(message);

      // Increment unread if not in that chat
      const currentActiveMatch = useChatStore.getState().activeMatchId;
      if (
        message.matchId !== currentActiveMatch &&
        message.senderId?._id !== user?._id
      ) {
        incrementUnread(message.matchId);

        // Show message notification toast
        const senderName = message.senderId?.name || 'Someone';
        Toast.show({
          type: 'info',
          text1: `💬 ${senderName}`,
          text2: message.content?.length > 50
            ? message.content.slice(0, 50) + '...'
            : message.content,
          visibilityTime: 4000,
          position: 'top',
          topOffset: 60,
        });
      }
    });

    socket.on('match_updated', (updatedMatch) => {
      useMatchStore.getState().updateMatch(updatedMatch);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken]);

  return { socket: socketRef.current };
}
