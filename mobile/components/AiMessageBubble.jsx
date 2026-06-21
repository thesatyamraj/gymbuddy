import { View, Text, TouchableOpacity } from 'react-native';
import { Bot, RotateCcw } from 'lucide-react-native';
import AiMarkdown from './AiMarkdown';
import { Colors } from '../lib/theme';

/**
 * AI Coach message bubble (mobile).
 * User messages reuse the sent-bubble look; assistant messages render Markdown
 * with a coach avatar, and the last assistant message gets a Regenerate action.
 */
export default function AiMessageBubble({ message, isLast, onRegenerate }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        <View
          style={{
            maxWidth: '80%',
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: Colors.primary,
            borderRadius: 16,
            borderBottomRightRadius: 6,
          }}
        >
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#ffffff' }}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          marginTop: 2,
        }}
      >
        <Bot size={16} color="#ffffff" />
      </View>

      <View style={{ flex: 1, maxWidth: '85%' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: Colors.surfaceRaised,
            borderRadius: 16,
            borderBottomLeftRadius: 6,
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <AiMarkdown content={message.content} />
        </View>

        {isLast && onRegenerate && (
          <TouchableOpacity
            onPress={onRegenerate}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, marginLeft: 4, paddingVertical: 4 }}
          >
            <RotateCcw size={13} color={Colors.iconFaint} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.iconFaint }}>
              Regenerate
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
