import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Dumbbell, Clock, SlidersHorizontal, Check } from 'lucide-react';

export const WORKOUT_TYPES = [
  'Any', 'Weightlifting', 'Cardio', 'CrossFit', 'Yoga', 'Calisthenics',
  'HIIT', 'Powerlifting', 'Swimming', 'Boxing', 'Other',
];

export const TIMINGS = [
  'Any', 'Early Morning (5-7am)', 'Morning (7-10am)', 'Afternoon (12-3pm)',
  'Evening (5-8pm)', 'Night (8pm+)', 'Flexible',
];

export const DISTANCES = [
  { label: 'Any', value: 'Any' },
  { label: '2 km', value: '2' },
  { label: '5 km', value: '5' },
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: '50 km', value: '50' },
];

export const DEFAULT_FILTERS = {
  gymName: '',
  workoutType: 'Any',
  timing: 'Any',
  maxDistance: 'Any',
};

export function countActiveFilters(f) {
  let n = 0;
  if (f.gymName && f.gymName.trim()) n++;
  if (f.workoutType && f.workoutType !== 'Any') n++;
  if (f.timing && f.timing !== 'Any') n++;
  if (f.maxDistance && f.maxDistance !== 'Any') n++;
  return n;
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? 'bg-primary-600 text-white border-primary-600 shadow-glow'
          : 'bg-surface text-slate-600 border-slate-200 hover:border-primary-300 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Filter modal for the Discover screen.
 * `locationReady` controls whether distance filtering is available.
 */
export default function DiscoverFilters({
  isOpen,
  onClose,
  initial,
  onApply,
  locationReady,
}) {
  const [draft, setDraft] = useState(initial || DEFAULT_FILTERS);

  useEffect(() => {
    if (isOpen) setDraft(initial || DEFAULT_FILTERS);
  }, [isOpen, initial]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-card-hover max-h-[88vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface/95 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary-500" />
                <h2 className="font-display uppercase tracking-wide text-xl font-bold text-slate-900">
                  Filters
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Gym name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 text-primary-500" /> Gym Name
                </label>
                <input
                  type="text"
                  value={draft.gymName}
                  onChange={(e) => set({ gymName: e.target.value })}
                  placeholder="e.g. Iron House"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-surface-sunken text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              {/* Workout type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <Dumbbell className="w-4 h-4 text-primary-500" /> Workout Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TYPES.map((t) => (
                    <Chip key={t} active={draft.workoutType === t} onClick={() => set({ workoutType: t })}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <Clock className="w-4 h-4 text-primary-500" /> Preferred Timing
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIMINGS.map((t) => (
                    <Chip key={t} active={draft.timing === t} onClick={() => set({ timing: t })}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
                  <MapPin className="w-4 h-4 text-primary-500" /> Distance
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISTANCES.map((d) => (
                    <Chip
                      key={d.value}
                      active={draft.maxDistance === d.value}
                      onClick={() => set({ maxDistance: d.value })}
                    >
                      {d.label}
                    </Chip>
                  ))}
                </div>
                {!locationReady && (
                  <p className="text-xs text-slate-400 mt-2">
                    Enable location access to filter by distance.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface/95 backdrop-blur-lg border-t border-slate-200 px-5 py-4 flex items-center gap-3">
              <button
                onClick={() => setDraft(DEFAULT_FILTERS)}
                className="px-4 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
                className="flex-1 px-5 py-3 bg-primary-600 text-white font-bold uppercase tracking-wide rounded-xl hover:bg-primary-700 shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
