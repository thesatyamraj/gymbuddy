import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import Toast from 'react-native-toast-message';

function buildParams(filters = {}) {
  const params = {};
  if (filters.gymName && filters.gymName.trim()) params.gymName = filters.gymName.trim();
  if (filters.workoutType && filters.workoutType !== 'Any') params.workoutType = filters.workoutType;
  if (filters.timing && filters.timing !== 'Any') params.timing = filters.timing;
  if (filters.maxDistance && filters.maxDistance !== 'Any') params.maxDistance = filters.maxDistance;
  return params;
}

/**
 * Hook for paginated swipe user fetching with optional filters.
 * @returns {{ users, isLoading, hasMore, fetchUsers, removeTopUser, setUsers }}
 */
export function useSwipeUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const filtersRef = useRef({});

  const fetchUsers = useCallback(async (reset = false, filters) => {
    if (reset && filters !== undefined) filtersRef.current = filters || {};
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const response = await api.get('/swipe/candidates', {
        params: { page: currentPage, limit: 10, ...buildParams(filtersRef.current) },
      });
      const { candidates, pagination } = response.data.data;

      if (reset) {
        setUsers(candidates);
        setPage(2);
      } else {
        setUsers((prev) => [...prev, ...candidates]);
        setPage((p) => p + 1);
      }
      setHasMore(pagination.hasMore);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load users';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const removeTopUser = useCallback(() => {
    setUsers((prev) => prev.slice(1));
  }, []);

  return { users, isLoading, hasMore, fetchUsers, removeTopUser, setUsers };
}
