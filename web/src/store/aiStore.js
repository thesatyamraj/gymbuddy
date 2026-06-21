import { create } from 'zustand';
import api from '../api/axios';

/**
 * Turn an axios error into a specific, user-facing message.
 * The backend's ApiResponse.error(message) already carries the right copy for
 * rate-limit / capacity / upstream cases, so we surface it directly. We only
 * fall back to a generic message when there's no response (network/timeout).
 */
const errorMessageFrom = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED') {
    return 'Could not reach the server. Check your connection.';
  }
  if (!err?.response) {
    return 'Could not reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
};

/**
 * AI Coach store — manages conversations, the active chat, and send state.
 * Mirrors the shape and conventions of chatStore.js: flat state, async actions
 * that call the shared `api` instance, silent-fail on read errors, and a
 * specific `error` string for send failures so the UI can render exact copy.
 */
export const useAiStore = create((set, get) => ({
  conversations: [], // [{ _id, title, updatedAt }]
  activeConversationId: null,
  messages: [], // [{ role: 'user' | 'assistant', content }]
  isSending: false,
  isLoadingConversation: false,
  error: null,

  /**
   * Load the list of the user's past conversations (newest first).
   * Silent-fail on read errors, matching chatStore.
   */
  loadConversations: async () => {
    try {
      const res = await api.get('/ai/conversations');
      set({ conversations: res.data.data.conversations || [] });
    } catch (error) {
      // Silent fail — the page still works without history.
    }
  },

  /**
   * Load a single conversation's full message list into the active view.
   */
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

  /**
   * Send a user message to the AI Coach.
   * Optimistically appends the user bubble, shows the thinking indicator, then
   * appends the assistant reply on success. On failure, keeps the user bubble
   * and exposes a specific `error` string (the UI offers a Retry).
   */
  sendMessage: async (text) => {
    const content = text.trim();
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

      // Refresh the sidebar so a newly created conversation shows up / re-sorts.
      get().loadConversations();
    } catch (error) {
      set({ isSending: false, error: errorMessageFrom(error) });
    }
  },

  /**
   * Retry the most recent user message after a failed send.
   * Does NOT append another user bubble — it re-sends the existing last user
   * message. (The backend only persists a turn on a successful Groq call, so
   * a retry never duplicates server-side history.)
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
   * Regenerate the answer to the last user message.
   * Drops the trailing assistant bubble from the view, then re-sends the last
   * user message to get a fresh reply.
   */
  regenerateLast: async () => {
    if (get().isSending) return;
    const msgs = get().messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    // Remove a trailing assistant message if present.
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

  /**
   * Delete a conversation. Clears the active view if it was the one deleted.
   */
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
      // Silent fail — the item simply stays in the list.
    }
  },

  /**
   * Start a fresh conversation (clears the active view).
   */
  startNewConversation: () =>
    set({ activeConversationId: null, messages: [], error: null }),

  /** Clear just the inline error (e.g. when the user edits the input). */
  clearError: () => set({ error: null }),
}));
