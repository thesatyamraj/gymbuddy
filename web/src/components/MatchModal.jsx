import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Full-screen match celebration modal with confetti
 */
export default function MatchModal({ isOpen, onClose, match, currentUser }) {
  const navigate = useNavigate();

  const otherUser = useMemo(() => {
    if (!match || !currentUser) return null;
    return match.users?.find(
      (u) => u._id !== currentUser._id
    );
  }, [match, currentUser]);

  const confettiColors = [
    '#e24b4a', '#ec4899', '#f43f5e', '#eab308', '#22c55e',
    '#3b82f6', '#a855f7', '#f97316',
  ];

  const confettiPieces = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: confettiColors[i % confettiColors.length],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, [isOpen]);

  if (!isOpen || !otherUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        {/* Confetti */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute top-0"
            style={{
              left: piece.left,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: window.innerHeight + 50,
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'easeOut',
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface ring-1 ring-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Profile Photos */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {currentUser?.profilePhoto ? (
                <img
                  src={currentUser.profilePhoto}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-3xl font-bold text-primary-600">
                    {currentUser?.name?.charAt(0)}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-xl">❤️</span>
            </motion.div>

            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {otherUser?.profilePhoto ? (
                <img
                  src={otherUser.profilePhoto}
                  alt={otherUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-3xl font-bold text-rose-600">
                    {otherUser?.name?.charAt(0)}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Match Text */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-black text-gradient mb-2"
          >
            It's a Match! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-500 mb-8"
          >
            You and {otherUser?.name} both want to train together!
          </motion.p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => {
                onClose();
                navigate(`/chats?match=${match._id}`);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-shadow"
            >
              <MessageCircle className="w-5 h-5" />
              Send a Message
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
              className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Keep Swiping
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
