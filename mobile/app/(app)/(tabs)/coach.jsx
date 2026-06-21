import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  Sparkles,
  Bot,
  Plus,
  History,
  Trash2,
  X,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useAiStore } from '../../../store/aiStore';
import { QUICK_PROMPTS } from '../../../constants/aiPrompts';
import AiMessageBubble from '../../../components/AiMessageBubble';
import TypingIndicator from '../../../components/TypingIndicator';
import { Colors } from '../../../lib/theme';

const DISCLAIMER =
  'FITNEX Coach gives general fitness and nutrition suggestions for healthy adults. It is not a substitute for advice from a doctor, registered dietitian, or certified personal trainer — especially if you have a medical condition, injury, pregnancy, or concerns about eating or body image.';

/**
 * AI Coach tab — chat UI for the FITNEX Coach assistant on mobile.
 * Mirrors the chat screen's structure (KeyboardAvoidingView + inverted
 * FlatList) and reuses the same /api/ai/* backend as the web app.
 */
export default function CoachScreen() {
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
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    startNewConversation();
    loadConversations();
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    sendMessage(text);
  };

  const handleChip = (prompt) => {
    if (isSending) return;
    sendMessage(prompt);
  };

  const handleNewChat = () => {
    setHistoryOpen(false);
    startNewConversation();
  };

  const handleSelectConversation = (id) => {
    setHistoryOpen(false);
    if (id !== activeConversationId) loadConversation(id);
  };

  const isEmpty = messages.length === 0;
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  // Header + disclaimer, rendered as the (inverted) list footer so it stays on top.
  const renderListFooter = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.primarySurface,
        borderRadius: 12,
        marginBottom: 12,
      }}
    >
      <ShieldAlert size={16} color={Colors.primary} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontSize: 11, lineHeight: 15, color: Colors.primary900 }}>
        {DISCLAIMER}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    // Data is reversed for the inverted list, so map back to the real index.
    const realIndex = messages.length - 1 - index;
    const isLast = realIndex === lastAssistantIndex && !isSending;
    return (
      <AiMessageBubble
        message={item}
        isLast={isLast}
        onRegenerate={isLast ? regenerateLast : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: 0.3 }}>
              FITNEX Coach
            </Text>
            <Text style={{ fontSize: 12, color: Colors.iconFaint }}>
              Your AI fitness & nutrition buddy
            </Text>
          </View>
          <TouchableOpacity onPress={() => setHistoryOpen(true)} style={{ padding: 6 }}>
            <History size={22} color={Colors.textBody} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewChat} style={{ padding: 6 }}>
            <Plus size={22} color={Colors.textBody} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        {isLoadingConversation ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : isEmpty ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
            {renderListFooter()}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Bot size={32} color="#ffffff" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4, textAlign: 'center' }}>
                How can I help you train?
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 18, paddingHorizontal: 12 }}>
                Ask for a workout plan, a meal idea, or anything fitness. Not sure where to start? Tap one:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => handleChip(p.prompt)}
                    disabled={isSending}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: Colors.surface,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      opacity: isSending ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.textStrong }}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={[...messages].reverse()}
            renderItem={renderItem}
            keyExtractor={(_, i) => `m-${i}`}
            inverted
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderListFooter}
            ListHeaderComponent={
              isSending ? (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: Colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Bot size={16} color="#ffffff" />
                  </View>
                  <TypingIndicator />
                </View>
              ) : null
            }
          />
        )}

        {/* Inline error */}
        {error ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: Colors.roseSurface,
              borderWidth: 1,
              borderColor: Colors.roseSurface2,
              borderRadius: 12,
            }}
          >
            <AlertTriangle size={16} color={Colors.error} />
            <Text style={{ flex: 1, fontSize: 13, color: Colors.error }}>{error}</Text>
            <TouchableOpacity
              onPress={retryLast}
              disabled={isSending}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: isSending ? 0.5 : 1 }}
            >
              <RotateCcw size={14} color={Colors.error} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.error }}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Composer */}
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
            value={input}
            onChangeText={setInput}
            placeholder="Ask FITNEX Coach anything…"
            placeholderTextColor={Colors.iconFaint}
            maxLength={1000}
            multiline
            editable={!isSending}
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.bg,
              fontSize: 14,
              maxHeight: 110,
              color: Colors.textSecondary,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            style={{
              width: 48,
              height: 48,
              backgroundColor: Colors.primary,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !input.trim() || isSending ? 0.5 : 1,
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

      {/* History modal */}
      <Modal
        visible={historyOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View
            style={{
              maxHeight: '70%',
              backgroundColor: Colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>History</Text>
              <TouchableOpacity onPress={() => setHistoryOpen(false)} style={{ padding: 4 }}>
                <X size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleNewChat}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginHorizontal: 16,
                marginTop: 12,
                paddingVertical: 12,
                backgroundColor: Colors.primary,
                borderRadius: 12,
              }}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>New chat</Text>
            </TouchableOpacity>

            {conversations.length === 0 ? (
              <Text style={{ padding: 20, fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                Your past chats will show up here.
              </Text>
            ) : (
              <ScrollView style={{ marginTop: 8 }}>
                {conversations.map((c) => (
                  <View
                    key={c._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      backgroundColor:
                        c._id === activeConversationId ? Colors.primarySurface : 'transparent',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleSelectConversation(c._id)}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    >
                      <MessageSquare
                        size={16}
                        color={c._id === activeConversationId ? Colors.primary : Colors.iconFaint}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.textStrong }} numberOfLines={1}>
                          {c.title}
                        </Text>
                        <Text style={{ fontSize: 11, color: Colors.iconFaint }}>
                          {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteConversation(c._id)} style={{ padding: 6 }}>
                      <Trash2 size={16} color={Colors.iconFaint} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
