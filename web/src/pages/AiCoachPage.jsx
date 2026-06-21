import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  Bot,
  Sparkles,
  Plus,
  Trash2,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  History,
  X,
  ShieldAlert,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAiStore } from '../store/aiStore';
import { QUICK_PROMPTS } from '../constants/aiPrompts';
import AiMessageBubble from '../components/AiMessageBubble';
import TypingIndicator from '../components/TypingIndicator';

const DISCLAIMER =
  'FITNEX Coach gives general fitness and nutrition suggestions for healthy adults. It is not a substitute for advice from a doctor, registered dietitian, or certified personal trainer — especially if you have a medical condition, injury, pregnancy, or concerns about eating or body image.';

/**
 * AI Coach page — chat UI for the FITNEX Coach assistant.
 * Layout mirrors ChatsPage: a conversation-history sidebar (desktop) / drawer
 * (mobile) beside the chat column. Visuals follow the FITNEX theme.
 */
export default function AiCoachPage() {
  const {
    conversations,
    messages,
    activeConversationId,
    isSending,
    isLoadingConversation,
    error,
    loadConversations,
    loadConversation,
    deleteConversation,
    sendMessage,
    regenerateLast,
    retryLast,
    startNewConversation,
  } = useAiStore();

  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // On mount: start a fresh chat and load the history list.
  useEffect(() => {
    startNewConversation();
    loadConversations();
  }, [startNewConversation, loadConversations]);

  // Auto-scroll to the newest message / thinking indicator.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (prompt) => {
    if (isSending) return;
    sendMessage(prompt);
  };

  const handleSelectConversation = (id) => {
    setDrawerOpen(false);
    if (id === activeConversationId) return;
    loadConversation(id);
  };

  const handleNewChat = () => {
    setDrawerOpen(false);
    startNewConversation();
  };

  const isEmpty = messages.length === 0;
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  // ─── Sidebar content (shared between desktop column and mobile drawer) ───
  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all ripple"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          History
        </p>
        {conversations.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-400">
            Your past chats will show up here.
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((c) => (
              <div
                key={c._id}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                  c._id === activeConversationId
                    ? 'bg-primary-600/15 ring-1 ring-primary-500/30'
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => handleSelectConversation(c._id)}
              >
                <MessageSquare
                  className={`w-4 h-4 flex-shrink-0 ${
                    c._id === activeConversationId
                      ? 'text-primary-500'
                      : 'text-slate-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDistanceToNow(new Date(c.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 flex-shrink-0 bg-surface ring-1 ring-slate-200 border-r border-slate-200">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-display text-lg font-bold uppercase tracking-wide text-slate-900">
                  History
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="h-[calc(100%-65px)]">{SidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-surface ring-1 ring-slate-200 border-b border-slate-200">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="History"
          >
            <History className="w-5 h-5 text-slate-600" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900 leading-tight">
              FITNEX Coach
            </h1>
            <p className="text-xs text-slate-400">
              Your AI fitness &amp; nutrition buddy
            </p>
          </div>
          <button
            onClick={handleNewChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Disclaimer banner — persistent, non-dismissible */}
        <div className="flex items-start gap-2 px-4 py-2.5 bg-primary-50 border-b border-primary-100">
          <ShieldAlert className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug text-primary-900/80">
            {DISCLAIMER}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingConversation ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
            </div>
          ) : isEmpty ? (
            /* Empty state + quick-prompt chips */
            <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 mb-1">
                How can I help you train?
              </h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                Ask for a workout plan, a meal idea, or anything fitness. Not sure
                where to start? Tap one of these:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleChip(p.prompt)}
                    disabled={isSending}
                    className="text-left px-4 py-3 rounded-xl bg-surface ring-1 ring-slate-200 border border-slate-100 text-sm font-medium text-slate-700 hover:ring-primary-300 hover:shadow-card hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((m, i) => (
                <AiMessageBubble
                  key={i}
                  message={m}
                  isLast={i === lastAssistantIndex && !isSending}
                  onRegenerate={
                    i === lastAssistantIndex && !isSending
                      ? regenerateLast
                      : undefined
                  }
                />
              ))}

              {isSending && (
                <div className="flex justify-start mb-3">
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <TypingIndicator userName="FITNEX Coach" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Inline error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mx-4 mb-2 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="flex-1 text-sm text-red-700">{error}</p>
              <button
                onClick={retryLast}
                disabled={isSending}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-surface ring-1 ring-slate-200 border-t border-slate-200"
        >
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask FITNEX Coach anything about training or nutrition…"
              rows={1}
              maxLength={1000}
              disabled={isSending}
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-slate-100 transition-all max-h-32 disabled:opacity-60"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isSending}
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
    </div>
  );
}
