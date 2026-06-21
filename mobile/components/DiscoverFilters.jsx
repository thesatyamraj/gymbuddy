import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, MapPin, Dumbbell, Clock, SlidersHorizontal, Check } from 'lucide-react-native';
import { Colors } from '../lib/theme';

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

function Chip({ active, label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: active ? Colors.primary : Colors.surface,
        borderColor: active ? Colors.primary : Colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: active ? Colors.white : Colors.textBody,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={16} color={Colors.brand} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textStrong }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * Filter modal for the mobile Discover screen.
 */
export default function DiscoverFilters({ visible, onClose, initial, onApply, locationReady }) {
  const [draft, setDraft] = useState(initial || DEFAULT_FILTERS);

  useEffect(() => {
    if (visible) setDraft(initial || DEFAULT_FILTERS);
  }, [visible, initial]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '85%',
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={20} color={Colors.brand} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text }}>Filters</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: Colors.sunken,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color={Colors.textBody} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {/* Gym name */}
            <Section icon={MapPin} title="Gym Name">
              <TextInput
                value={draft.gymName}
                onChangeText={(t) => set({ gymName: t })}
                placeholder="e.g. Iron House"
                placeholderTextColor={Colors.iconFaint}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: Colors.sunken,
                  color: Colors.text,
                  fontSize: 14,
                }}
              />
            </Section>

            {/* Workout type */}
            <Section icon={Dumbbell} title="Workout Type">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {WORKOUT_TYPES.map((t) => (
                  <Chip key={t} label={t} active={draft.workoutType === t} onPress={() => set({ workoutType: t })} />
                ))}
              </View>
            </Section>

            {/* Timing */}
            <Section icon={Clock} title="Preferred Timing">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIMINGS.map((t) => (
                  <Chip key={t} label={t} active={draft.timing === t} onPress={() => set({ timing: t })} />
                ))}
              </View>
            </Section>

            {/* Distance */}
            <Section icon={MapPin} title="Distance">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DISTANCES.map((d) => (
                  <Chip
                    key={d.value}
                    label={d.label}
                    active={draft.maxDistance === d.value}
                    onPress={() => set({ maxDistance: d.value })}
                  />
                ))}
              </View>
              {!locationReady && (
                <Text style={{ fontSize: 12, color: Colors.iconFaint, marginTop: 8 }}>
                  Enable location access to filter by distance.
                </Text>
              )}
            </Section>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 28,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
            }}
          >
            <TouchableOpacity onPress={() => setDraft(DEFAULT_FILTERS)} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ color: Colors.textBody, fontWeight: '700' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              activeOpacity={0.85}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: Colors.primary,
              }}
            >
              <Check size={20} color={Colors.white} />
              <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
