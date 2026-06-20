import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import { useChatStore } from '../store/chatStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Socket.io connection hook
 * Manages connection lifecycle, event listeners, and real-time notifications
 * Shows toast notifications for new matches and incoming messages
 * @returns {{ socket: import('socket.io-client').Socket | null }}
 */
export function useSocket() {
  const socketRef = useRef(null);
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const { addMatch } = useMatchStore();
  const { addMessage, incrementUnread, activeMatchId } = useChatStore();

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
      console.log('🔌 Socket connected');
    });

    socket.on('new_match', (match) => {
      addMatch(match);

      // Show match notification toast
      const otherUser = match.users?.find((u) => u._id !== user?._id);
      const matchName = otherUser?.name || 'Someone';
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'notification-pop' : 'opacity-0'
            } max-w-md w-full bg-gradient-to-r from-indigo-900 to-purple-900 shadow-2xl rounded-2xl pointer-events-auto flex items-center ring-1 ring-white/10 p-4 gap-3`}
          >
            <div className="flex-shrink-0">
              {otherUser?.profilePhoto ? (
                <img
                  className="h-12 w-12 rounded-xl object-cover border-2 border-white/20"
                  src={otherUser.profilePhoto}
                  alt={matchName}
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-lg font-bold">
                  {matchName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">
                🎉 New Match!
              </p>
              <p className="text-sm text-indigo-200 truncate">
                You and {matchName} are gym buddies!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 5000, position: 'top-right' }
      );
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
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'notification-pop' : 'opacity-0'
              } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex items-center ring-1 ring-slate-200 p-4 gap-3`}
            >
              <div className="flex-shrink-0">
                {message.senderId?.profilePhoto ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={message.senderId.profilePhoto}
                    alt={senderName}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  💬 {senderName}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {message.content}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ),
          { duration: 4000, position: 'top-right' }
        );
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
