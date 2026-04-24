import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTasks() {
  return useQuery<Array<Record<string, unknown>>, Error>({
    queryKey: ['tasks'],
    queryFn: api.getTasks,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createTask(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reorder: Array<{id: string; status?: string; column_order?: number}>) =>
      api.reorderTasks(reorder),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
