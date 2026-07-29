import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard');
      return data.data;
    },
  });
}
