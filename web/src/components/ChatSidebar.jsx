import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import OnlineBadge from './OnlineBadge';

/**
 * Chat list sidebar for desktop layout
 * Shows all matches with last message preview and unread badges
 */
export default function ChatSidebar({
  matches,
  activeMatchId,
  onSelectMatch,
  onlineUsers,
  unreadCounts,
  currentUserId,
}) {
  const navigate = useNavigate();

  const formatLastMessage = (match) => {
    if (!match.lastMessage) return 'Say hello! 👋';
    const isMine = match.lastMessage.senderId === currentUserId;
    const prefix = isMine ? 'You: ' : '';
    const content = match.lastMessage.content;
    return `${prefix}${content.length > 35 ? content.slice(0, 35) + '...' : content}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="w-80 border-r border-slate-200 bg-surface ring-1 ring-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-slate-500 text-sm">
              No conversations yet. Match with someone to start chatting!
            </p>
          </div>
        ) : (
          matches.map((match) => {
            const otherUser = match.otherUser;
            if (!otherUser) return null;

            const isOnline = onlineUsers.includes(otherUser._id);
            const unread = unreadCounts[match._id] || 0;
            const isActive = match._id === activeMatchId;

            return (
              <button
                key={match._id}
                onClick={() => onSelectMatch(match)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                  isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  {otherUser.profilePhoto ? (
                    <img
                      src={otherUser.profilePhoto}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {otherUser.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineBadge isOnline={isOnline} size="sm" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {otherUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {formatTime(match.lastMessageAt || match.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-500 truncate">
                      {formatLastMessage(match)}
                    </p>
                    {unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
