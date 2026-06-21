/**
 * Animated typing indicator (three bouncing dots)
 */
export default function TypingIndicator({ userName }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="px-4 py-3 bg-surface ring-1 ring-slate-200 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
        <div className="flex items-center gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
      {userName && (
        <span className="text-xs text-slate-400">{userName} is typing...</span>
      )}
    </div>
  );
}
