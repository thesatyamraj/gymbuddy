import { useState, useCallback } from 'react';
import api from '../api/axios';
import Toast from 'react-native-toast-message';

/**
 * Hook for paginated swipe user fetching
 * @returns {{ users, isLoading, hasMore, fetchUsers, removeTopUser }}
 */
export function useSwipeUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const response = await api.get('/swipe/candidates', {
        params: { page: currentPage, limit: 10 },
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
