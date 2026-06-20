import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

/**
 * Individual message bubble component
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 ${
          isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? 'text-white/60' : 'text-slate-400'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            message.read ? (
              <CheckCheck className="w-3 h-3 text-blue-300" />
            ) : (
              <Check className="w-3 h-3 text-white/50" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
