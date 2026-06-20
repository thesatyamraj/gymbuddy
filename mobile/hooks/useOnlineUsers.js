import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * Hook to track online users via Socket.io
 * @returns {{ onlineUsers: string[] }}
 */
export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  return { onlineUsers };
}
