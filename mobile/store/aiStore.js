import { create } from 'zustand';
import api from '../api/axios';

/**
 * Turn an axios error into a specific, user-facing message.
 * The backend's ApiResponse.error(message) carries the right copy for
 * rate-limit / capacity / upstream cases, so we surface it directly and only
 * fall back to a generic message when there's no response (network/timeout).
 */
const errorMessageFrom = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED' || !err?.response) {
    return 'Could not reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
};

/**
 * AI Coach store (mobile) — mirrors store/chatStore.js conventions: flat state,
 * async actions on the shared `api` instance, silent-fail on read errors, and a
 * specific `error` string for send failures so the UI can render exact copy.
 */
export const useAiStore = create((set, get) => ({
  conversations: [], // [{ _id, title, updatedAt }]
  activeConversationId: null,
  messages: [], // [{ role: 'user' | 'assistant', content }]
  isSending: false,
  isLoadingConversation: false,
  error: null,

  loadConversations: async () => {
    try {
      const res = await api.get('/ai/conversations');
      set({ conversations: res.data.data.conversations || [] });
    } catch (error) {
      // Silent fail — the screen still works without history.
    }
  },

  loadConversation: async (id) => {
    set({ isLoadingConversation: true, error: null });
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      const { conversation } = res.data.data;
      set({
        activeConversationId: conversation._id,
        messages: conversation.messages || [],
        isLoadingConversation: false,
      });
    } catch (error) {
      set({ isLoadingConversation: false });
    }
  },

  sendMessage: async (text) => {
    const content = (text || '').trim();
    if (!content || get().isSending) return;

    set((state) => ({
      messages: [...state.messages, { role: 'user', content }],
      isSending: true,
      error: null,
    }));

    try {
      const res = await api.post('/ai/chat', {
        message: content,
        conversationId: get().activeConversationId || undefined,
      });
      const { conversationId, reply } = res.data.data;
      set((state) => ({
        activeConversationId: conversationId,
        messages: [...state.messages, { role: 'assistant', content: reply }],
        isSending: false,
      }));
      get().loadConversations();
    } catch (error) {
      set({ isSending: false, error: errorMessageFrom(error) });
    }
  },

  /**
   * Retry the last user message after a failed send (no extra user bubble).
   */
  retryLast: async () => {
    if (get().isSending) return;
    const lastUser = [...get().messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    set({ isSending: true, error: null });
    try {
      const res = await api.post('/ai/chat', {
        message: lastUser.content,
        conversationId: get().activeConversationId || undefined,
      });
      const { conversationId, reply } = res.data.data;
      set((state) => ({
        activeConversationId: conversationId,
        messages: [...state.messages, { role: 'assistant', content: reply }],
        isSending: false,
      }));
      get().loadConversations();
    } catch (error) {
      set({ isSending: false, error: errorMessageFrom(error) });
    }
  },

  /**
   * Regenerate the answer to the last user message (drops trailing assistant bubble).
   */
  regenerateLast: async () => {
    if (get().isSending) return;
    const msgs = get().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    const trimmed =
      msgs.length && msgs[msgs.length - 1].role === 'assistant'
        ? msgs.slice(0, -1)
        : msgs;
    set({ messages: trimmed, isSending: true, error: null });

    try {
      const res = await api.post('/ai/chat', {
        message: lastUser.content,
        conversationId: get().activeConversationId || undefined,
      });
      const { conversationId, reply } = res.data.data;
      set((state) => ({
        activeConversationId: conversationId,
        messages: [...state.messages, { role: 'assistant', content: reply }],
        isSending: false,
      }));
      get().loadConversations();
    } catch (error) {
      set({ isSending: false, error: errorMessageFrom(error) });
    }
  },

  deleteConversation: async (id) => {
    try {
      await api.delete(`/ai/conversations/${id}`);
      set((state) => {
        const conversations = state.conversations.filter((c) => c._id !== id);
        const wasActive = state.activeConversationId === id;
        return {
          conversations,
          activeConversationId: wasActive ? null : state.activeConversationId,
          messages: wasActive ? [] : state.messages,
        };
      });
    } catch (error) {
      // Silent fail.
    }
  },

  startNewConversation: () =>
    set({ activeConversationId: null, messages: [], error: null }),

  clearError: () => set({ error: null }),
}));
