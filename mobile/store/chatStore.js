import { create } from 'zustand';
import api from '../api/axios';

/**
 * Chat store — manages messages, unread counts, and active chat state
 */
export const useChatStore = create((set, get) => ({
  messages: [],
  unreadCounts: {}, // { matchId: count }
  totalUnread: 0,
  isLoading: false,
  hasMore: true,
  nextCursor: null,
  activeMatchId: null,

  /**
   * Set the active chat match ID
   */
  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),

  /**
   * Fetch unread message counts from server (called on app init)
   */
  fetchUnreadCounts: async () => {
    try {
      const response = await api.get('/messages/unread/counts');
      const { unreadCounts } = response.data.data;
      set({
        unreadCounts,
        totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
      });
    } catch (error) {
      // Silent fail — counts will still work via socket
    }
  },

  /**
   * Fetch messages for a match
   */
  fetchMessages: async (matchId, before = null) => {
    set({ isLoading: true });
    try {
      const params = { limit: 30 };
      if (before) params.before = before;

      const response = await api.get(`/messages/${matchId}`, { params });
      const { messages: newMessages, hasMore, nextCursor } = response.data.data;

      set((state) => ({
        messages: before ? [...newMessages, ...state.messages] : newMessages,
        hasMore,
        nextCursor,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
    }
  },

  /**
   * Send a message via REST API
   */
  sendMessage: async (matchId, content) => {
    try {
      const response = await api.post(`/messages/${matchId}`, { content });
      return response.data.data.message;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a new message (from socket)
   */
  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.find((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (matchId) => {
    try {
      await api.put(`/messages/${matchId}/read`);
      set((state) => {
        const newUnreadCounts = { ...state.unreadCounts };
        delete newUnreadCounts[matchId];
        return {
          unreadCounts: newUnreadCounts,
          totalUnread: Object.values(newUnreadCounts).reduce((a, b) => a + b, 0),
        };
      });
    } catch (error) {
      // Silent fail
    }
  },

  /**
   * Increment unread count for a match
   */
  incrementUnread: (matchId) => {
    set((state) => {
      const newUnreadCounts = {
        ...state.unreadCounts,
        [matchId]: (state.unreadCounts[matchId] || 0) + 1,
      };
      return {
        unreadCounts: newUnreadCounts,
        totalUnread: Object.values(newUnreadCounts).reduce((a, b) => a + b, 0),
      };
    });
  },

  /**
   * Clear messages when leaving a chat
   */
  clearMessages: () => set({ messages: [], hasMore: true, nextCursor: null }),
}));
