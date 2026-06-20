import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Dumbbell, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { useMatchStore } from '../store/matchStore';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { useAuthStore } from '../store/authStore';
import OnlineBadge from '../components/OnlineBadge';

/**
 * Matches page — displays all matched users in a responsive grid
 * Each card shows the other user's profile with online status
 */
export default function MatchesPage() {
  const { matches, isLoading, fetchMatches, clearNewMatchCount } = useMatchStore();
  const { onlineUsers } = useOnlineUsers();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
    clearNewMatchCount();
  }, [fetchMatches, clearNewMatchCount]);

  const handleOpenChat = (match) => {
    navigate(`/chats?match=${match._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Your Matches</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-24 skeleton rounded-lg" />
                  <div className="h-4 w-32 skeleton rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-full border border-rose-100 mb-4">
            <Heart className="w-4 h-4" />
            Matches
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Your Matches
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </p>
        </motion.div>

        {/* Empty State */}
        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No matches yet
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Keep swiping to find your perfect gym partner! When you both like each other, you'll match.
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all"
            >
              Start Swiping
            </button>
          </motion.div>
        ) : (
          /* Match Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((match, index) => {
              const otherUser = match.otherUser || match.users?.find(
                (u) => u._id !== user?._id
              );
              if (!otherUser) return null;

              const isOnline = onlineUsers.includes(otherUser._id);

              return (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <button
                    onClick={() => handleOpenChat(match)}
                    className="w-full bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 text-left"
                  >
                    {/* Photo */}
                    <div className="relative aspect-square overflow-hidden">
                      {otherUser.profilePhoto ? (
                        <img
                          src={otherUser.profilePhoto}
                          alt={otherUser.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                          <span className="text-5xl text-white/30 font-bold">
                            {otherUser.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Online Badge */}
                      <div className="absolute top-3 right-3">
                        <OnlineBadge isOnline={isOnline} size="md" />
                      </div>

                      {/* Chat icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <MessageCircle className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {otherUser.name}
                      </h3>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {otherUser.gymName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                            <MapPin className="w-2.5 h-2.5" />
                            {otherUser.gymName.length > 15
                              ? otherUser.gymName.slice(0, 15) + '...'
                              : otherUser.gymName}
                          </span>
                        )}
                        {otherUser.workoutType && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-medium">
                            <Dumbbell className="w-2.5 h-2.5" />
                            {otherUser.workoutType}
                          </span>
                        )}
                      </div>

                      {otherUser.timing && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          {otherUser.timing}
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
