const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  getTasks: () => request<Array<Record<string, unknown>>>('/tasks'),
  getTask: (id: string) => request<Record<string, unknown>>(`/tasks/${id}`),
  createTask: (data: Record<string, unknown>) => request<Record<string, unknown>>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Record<string, unknown>) => request<Record<string, unknown>>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<{message: string}>(`/tasks/${id}`, { method: 'DELETE' }),
  reorderTasks: (reorder: Array<{id: string; status?: string; column_order?: number}>) =>
    request<{message: string}>('/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ reorder }) }),
  getStatus: () => request<{status: string; database: string}>('/status'),
  uploadAvatar: (userId: string, file: File) =>
    fetch(`/api/users/avatar/upload?user_id=${userId}`, {
      method: 'POST',
      body: file,
    }).then(res => {
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    }),
};
