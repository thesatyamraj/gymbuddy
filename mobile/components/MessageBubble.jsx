import { View, Text } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react-native';

/**
 * Individual chat message bubble
 * Styled differently for sent vs received messages
 */
export default function MessageBubble({ message, isOwn }) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday ' + format(date, 'h:mm a');
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <View className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <View
        className={`max-w-[75%] px-4 py-2.5 ${
          isOwn
            ? 'bg-primary-600 rounded-2xl rounded-br-md'
            : 'bg-white rounded-2xl rounded-bl-md border border-slate-100'
        }`}
        style={
          !isOwn
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : undefined
        }
      >
        <Text
          className={`text-sm leading-5 ${
            isOwn ? 'text-white' : 'text-slate-800'
          }`}
        >
          {message.content}
        </Text>
        <View
          className={`flex-row items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <Text
            className={`text-[10px] ${
              isOwn ? 'text-white/60' : 'text-slate-400'
            }`}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isOwn &&
            (message.read ? (
              <CheckCheck size={12} color="rgba(147,197,253,1)" />
            ) : (
              <Check size={12} color="rgba(255,255,255,0.5)" />
            ))}
        </View>
      </View>
    </View>
  );
}
