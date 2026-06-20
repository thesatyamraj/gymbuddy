import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Match store — manages user matches list and new match count badge
 */
export const useMatchStore = create((set, get) => ({
  matches: [],
  isLoading: false,
  newMatchCount: 0,

  /**
   * Fetch all matches from server
   */
  fetchMatches: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/matches');
      set({ matches: response.data.data.matches, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Failed to load matches';
      toast.error(message);
    }
  },

  /**
   * Add a new match (called when match event received via socket)
   * Increments new match count for badge display
   */
  addMatch: (match) => {
    set((state) => {
      const exists = state.matches.find((m) => m._id === match._id);
      if (exists) return state;
      return {
        matches: [match, ...state.matches],
        newMatchCount: state.newMatchCount + 1,
      };
    });
  },

  /**
   * Clear the new match count (called when user visits Matches page)
   */
  clearNewMatchCount: () => set({ newMatchCount: 0 }),

  /**
   * Update an existing match (e.g., when a new message arrives)
   */
  updateMatch: (updatedMatch) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m._id === updatedMatch._id ? { ...m, ...updatedMatch } : m
      ),
    }));
  },
}));
