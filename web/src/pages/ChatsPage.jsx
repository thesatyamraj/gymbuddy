import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Loader2,
  ChevronUp,
} from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import ChatSidebar from '../components/ChatSidebar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import OnlineBadge from '../components/OnlineBadge';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Chats page — responsive layout
 * Desktop: sidebar (chat list) + chat window
 * Mobile: full-screen list OR full-screen chat
 */
export default function ChatsPage() {
  const [searchParams] = useSearchParams();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { matches, isLoading: matchesLoading, fetchMatches } = useMatchStore();
  const {
    messages,
    isLoading: messagesLoading,
    hasMore,
    nextCursor,
    fetchMessages,
    sendMessage,
    addMessage,
    markAsRead,
    clearMessages,
    setActiveMatch,
    unreadCounts,
    incrementUnread,
    fetchUnreadCounts,
  } = useChatStore();
  const { user, accessToken } = useAuthStore();
  const { onlineUsers } = useOnlineUsers();

  // Fetch matches and unread counts on mount
  useEffect(() => {
    fetchMatches();
    fetchUnreadCounts();
  }, [fetchMatches, fetchUnreadCounts]);

  // Auto-select match from URL param
  useEffect(() => {
    const matchId = searchParams.get('match');
    if (matchId && matches.length > 0) {
      const match = matches.find((m) => m._id === matchId);
      if (match) {
        handleSelectMatch(match);
      }
    }
  }, [searchParams, matches]);

  // Socket connection for chat
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('new_message', (message) => {
      addMessage(message);
      const currentActive = useChatStore.getState().activeMatchId;
      if (
        message.matchId !== currentActive &&
        message.senderId?._id !== user?._id
      ) {
        incrementUnread(message.matchId);
      }
    });

    socket.on('user_typing', ({ userId }) => {
      if (userId !== user?._id) {
        setTypingUser(userId);
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', ({ userId }) => {
      if (userId !== user?._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    socket.on('messages_read', ({ matchId, readBy }) => {
      if (readBy !== user?._id) {
        // Update message read status visually if needed
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectMatch = useCallback(
    (match) => {
      // Leave previous room
      if (selectedMatch && socketRef.current) {
        socketRef.current.emit('leave_match', selectedMatch._id);
      }

      setSelectedMatch(match);
      setActiveMatch(match._id);
      clearMessages();
      fetchMessages(match._id);
      markAsRead(match._id);

      // Join new room
      if (socketRef.current) {
        socketRef.current.emit('join_match', match._id);
      }
    },
    [selectedMatch, setActiveMatch, clearMessages, fetchMessages, markAsRead]
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedMatch || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setIsSending(true);

    // Stop typing
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { matchId: selectedMatch._id });
    }

    try {
      await sendMessage(selectedMatch._id, content);
    } catch (error) {
      setMessageText(content); // Restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!socketRef.current || !selectedMatch) return;

    socketRef.current.emit('typing', { matchId: selectedMatch._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { matchId: selectedMatch._id });
    }, 2000);
  };

  const handleLoadMore = () => {
    if (hasMore && !messagesLoading && selectedMatch) {
      fetchMessages(selectedMatch._id, nextCursor);
    }
  };

  const handleBack = () => {
    if (selectedMatch && socketRef.current) {
      socketRef.current.emit('leave_match', selectedMatch._id);
    }
    setSelectedMatch(null);
    setActiveMatch(null);
    clearMessages();
  };

  const getOtherUser = (match) => {
    return (
      match.otherUser ||
      match.users?.find((u) => u._id !== user?._id)
    );
  };

  const otherUser = selectedMatch ? getOtherUser(selectedMatch) : null;
  const isOtherOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex">
      {/* Sidebar — visible on desktop, or on mobile when no chat is selected */}
      <div
        className={`${
          selectedMatch ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto`}
      >
        <ChatSidebar
          matches={matches}
          activeMatchId={selectedMatch?._id}
          onSelectMatch={handleSelectMatch}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          currentUserId={user?._id}
        />
      </div>

      {/* Chat Window */}
      {selectedMatch ? (
        <div className="flex-1 flex flex-col bg-white md:bg-slate-50">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="relative">
              {otherUser?.profilePhoto ? (
                <img
                  src={otherUser.profilePhoto}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {otherUser?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5">
                <OnlineBadge isOnline={isOtherOnline} size="sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">
                {otherUser?.name}
              </h3>
              <p className="text-xs text-slate-400">
                {isTyping ? 'typing...' : isOtherOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-1"
          >
            {/* Load More */}
            {hasMore && (
              <div className="text-center py-2">
                <button
                  onClick={handleLoadMore}
                  disabled={messagesLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50"
                >
                  {messagesLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                  Load older messages
                </button>
              </div>
            )}

            {/* Messages */}
            {messagesLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary-300" />
                </div>
                <p className="text-slate-500 text-sm">
                  No messages yet. Say hello! 👋
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={
                    message.senderId?._id === user?._id ||
                    message.senderId === user?._id
                  }
                />
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <TypingIndicator userName={otherUser?.name} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-slate-200"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={handleTyping}
                placeholder="Type a message..."
                maxLength={2000}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </form>
        </div>
      ) : (
        /* No chat selected — Desktop placeholder */
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              Your Messages
            </h3>
            <p className="text-slate-400 text-sm">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
