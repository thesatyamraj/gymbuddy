import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { MapPin, Dumbbell, Clock, Heart, X } from 'lucide-react';

/**
 * Single swipe card component using Framer Motion drag
 * Shows user photo, details, and drag overlays for like/pass
 * Height constrained to fit viewport with buttons below
 */
export default function SwipeCard({ user, onSwipe, isTop, style }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      animate(x, 500, { duration: 0.3 });
      setTimeout(() => onSwipe('like'), 150);
    } else if (info.offset.x < -threshold) {
      animate(x, -500, { duration: 0.3 });
      setTimeout(() => onSwipe('pass'), 150);
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{
        ...style,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileDrag={{ cursor: 'grabbing' }}
      initial={isTop ? { scale: 1 } : {}}
      whileHover={isTop ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      exit={{
        x: 500,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden swipe-card-shadow cursor-grab select-none">
        {/* User Photo */}
        {user.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
            <span className="text-8xl text-white/30 font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient Overlay — stronger for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Like Overlay */}
        {isTop && (
          <motion.div
            className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <div className="border-4 border-green-400 rounded-2xl px-8 py-3 rotate-[-20deg] shadow-lg shadow-green-400/30">
              <span className="text-green-400 text-4xl font-black tracking-wider">
                LIKE
              </span>
            </div>
          </motion.div>
        )}

        {/* Pass Overlay */}
        {isTop && (
          <motion.div
            className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none"
            style={{ opacity: passOpacity }}
          >
            <div className="border-4 border-red-400 rounded-2xl px-8 py-3 rotate-[20deg] shadow-lg shadow-red-400/30">
              <span className="text-red-400 text-4xl font-black tracking-wider">
                NOPE
              </span>
            </div>
          </motion.div>
        )}

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{user.name}</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {user.gymName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                <MapPin className="w-3 h-3" />
                {user.gymName}
              </span>
            )}
            {user.workoutType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                <Dumbbell className="w-3 h-3" />
                {user.workoutType}
              </span>
            )}
            {user.timing && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                <Clock className="w-3 h-3" />
                {user.timing}
              </span>
            )}
          </div>

          {user.bio && (
            <p className="text-white/80 text-sm line-clamp-2 drop-shadow">{user.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
