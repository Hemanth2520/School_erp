import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useApiList<T = any>(key: string, params = {}) {
  return useQuery<T[]>({
    queryKey: [key, params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/${key}`, { params });
      return data.data;
    },
  });
}

export function useApiStats(key: string) {
  return useQuery({
    queryKey: [key, 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/${key}/stats`);
      return data.data;
    },
  });
}

export function useApiGet<T = any>(key: string, id: string) {
  return useQuery<T>({
    queryKey: [key, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/${key}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useApiCreate<T = any>() {
  const queryClient = useQueryClient();
  return useMutation<T, Error, { path: string; data: any }>({
    mutationFn: async ({ path, data }: { path: string; data: any }) => {
      const { data: response } = await apiClient.post(`/${path}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.path] });
    },
  });
}

export function useApiUpdate<T = any>() {
  const queryClient = useQueryClient();
  return useMutation<T, Error, { path: string; id: string; data: any }>({
    mutationFn: async ({ path, id, data }: { path: string; id: string; data: any }) => {
      const { data: response } = await apiClient.put(`/${path}/${id}`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.path] });
    },
  });
}

export function useApiDelete() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { path: string; id: string }>({
    mutationFn: async ({ path, id }: { path: string; id: string }) => {
      const { data: response } = await apiClient.delete(`/${path}/${id}`);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.path] });
    },
  });
}
