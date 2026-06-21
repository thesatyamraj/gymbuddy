import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, RefreshCw, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import SwipeStack from '../components/SwipeStack';
import MatchModal from '../components/MatchModal';
import SkeletonCard from '../components/SkeletonCard';
import DiscoverFilters, { DEFAULT_FILTERS, countActiveFilters } from '../components/DiscoverFilters';
import { useSwipeUsers } from '../hooks/useSwipeUsers';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import api from '../api/axios';

/**
 * Discover page — main swipe screen with filters + real-time location.
 */
export default function DiscoverPage() {
  const [matchModalData, setMatchModalData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [locationReady, setLocationReady] = useState(false);
  const { users, isLoading, hasMore, fetchUsers } = useSwipeUsers();
  const { user } = useAuthStore();
  const { addMatch } = useMatchStore();
  const navigate = useNavigate();
  const didInit = useRef(false);

  // Capture the user's real-time location once, then load candidates.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const start = () => fetchUsers(true, filters);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await api.put('/users/location', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setLocationReady(true);
          } catch {
            /* ignore — distance filter just won't apply */
          } finally {
            start();
          }
        },
        () => start(), // permission denied / unavailable → load without distance
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipeComplete = () => {
    if (hasMore) fetchUsers(false);
  };

  const handleMatch = (match) => {
    addMatch(match);
    setMatchModalData(match);
  };

  const applyFilters = (next) => {
    setFilters(next);
    fetchUsers(true, next);
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col flex-1 w-full">
        {/* Page Header — compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 shrink-0 relative"
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-surface text-slate-600 hover:text-slate-900 hover:border-primary-300 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-semibold">Filters</span>
            {activeCount > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-100 mb-2">
            <Flame className="w-4 h-4" />
            Discover
          </div>
          <h1 className="font-display uppercase tracking-wide text-2xl font-bold text-slate-900">
            Find Your Gym Partner
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Swipe right to like, left to pass
          </p>
        </motion.div>

        {/* Swipe Area — centered and constrained */}
        <div className="flex-1 flex items-start justify-center pt-2 pb-4 min-h-0">
          {isLoading && users.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <SkeletonCard />
            </motion.div>
          ) : users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <RefreshCw className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No more profiles</h3>
              <p className="text-slate-500 max-w-sm mb-6">
                {activeCount > 0
                  ? 'No one matches these filters right now. Try widening them.'
                  : "You've seen everyone for now. Check back later for new gym buddies!"}
              </p>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={() => applyFilters(DEFAULT_FILTERS)}
                    className="px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => fetchUsers(true, filters)}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-glow transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </motion.div>
          ) : (
            <SwipeStack
              users={users}
              onSwipeComplete={handleSwipeComplete}
              onMatch={handleMatch}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      <DiscoverFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        initial={filters}
        onApply={applyFilters}
        locationReady={locationReady}
      />

      {/* Match Modal */}
      <MatchModal
        isOpen={!!matchModalData}
        onClose={() => setMatchModalData(null)}
        match={matchModalData}
        currentUser={user}
      />
    </div>
  );
}
