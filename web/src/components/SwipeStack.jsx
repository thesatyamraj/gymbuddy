import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X, RefreshCw, Keyboard } from 'lucide-react';
import SwipeCard from './SwipeCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Stack of swipe cards with like/pass functionality
 * Includes keyboard shortcuts (← for pass, → for like)
 * Layout: card and buttons fit entirely within the viewport
 */
export default function SwipeStack({ users, onSwipeComplete, onMatch, isLoading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showKeyHint, setShowKeyHint] = useState(true);

  const visibleUsers = users.slice(currentIndex, currentIndex + 3);

  const handleSwipe = useCallback(
    async (direction) => {
      if (isAnimating || currentIndex >= users.length) return;

      setIsAnimating(true);
      setShowKeyHint(false);
      const user = users[currentIndex];

      try {
        if (direction === 'like') {
          const response = await api.post(`/swipe/like/${user._id}`);
          if (response.data.data.isMatch) {
            onMatch(response.data.data.match);
          }
        } else {
          await api.post(`/swipe/pass/${user._id}`);
        }
      } catch (error) {
        toast.error('Action failed. Try again.');
      }

      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);

      // Trigger load more when running low
      if (currentIndex + 3 >= users.length) {
        onSwipeComplete();
      }
    },
    [currentIndex, users, isAnimating, onMatch, onSwipeComplete]
  );

  // Keyboard shortcuts: ← for pass, → for like
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating || currentIndex >= users.length) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('like');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('pass');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, isAnimating, currentIndex, users.length]);

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 mt-4 font-medium">Finding gym buddies...</p>
      </div>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <RefreshCw className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          No more profiles
        </h3>
        <p className="text-slate-500 max-w-sm">
          You've seen everyone for now. Check back later for new gym buddies!
        </p>
      </div>
    );
  }

  return (
    <div className="swipe-stack-container w-full max-w-sm mx-auto">
      {/* Card Stack — capped height to leave room for buttons */}
      <div className="relative w-full" style={{ height: 'min(420px, 55vh)' }}>
        <AnimatePresence>
          {visibleUsers.map((user, index) => {
            const isTop = index === 0;
            const scale = 1 - index * 0.05;
            const translateY = index * 10;

            return (
              <SwipeCard
                key={user._id}
                user={user}
                isTop={isTop}
                onSwipe={handleSwipe}
                style={{
                  scale,
                  y: translateY,
                  zIndex: 3 - index,
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Buttons — always visible below card */}
      <div className="flex items-center justify-center gap-6 mt-6 pb-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => handleSwipe('pass')}
          disabled={isAnimating || currentIndex >= users.length}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-slate-200 flex items-center justify-center text-slate-400 btn-pass-interactive disabled:opacity-50 disabled:cursor-not-allowed"
          title="Pass (← arrow key)"
        >
          <X className="w-7 h-7" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15, boxShadow: '0 0 30px rgba(244, 63, 94, 0.5)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => handleSwipe('like')}
          disabled={isAnimating || currentIndex >= users.length}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30 flex items-center justify-center text-white btn-like-glow disabled:opacity-50 disabled:cursor-not-allowed"
          title="Like (→ arrow key)"
        >
          <Heart className="w-9 h-9" fill="white" />
        </motion.button>
      </div>

      {/* Keyboard hint — fades out after first action */}
      <AnimatePresence>
        {showKeyHint && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center gap-1.5"
          >
            <Keyboard className="w-3 h-3" />
            Use <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">→</kbd> arrow keys
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
