import { api } from "../lib/api";
import type { Task, TaskRequest } from "../types";

export const tasksApi = {
  listByColumn: (columnId: number) =>
    api.get<Task[]>(`/api/v1/tasks/columns/${columnId}`).then((r) => r.data),

  create: (columnId: number, body: TaskRequest) =>
    api.post<Task>(`/api/v1/tasks/columns/${columnId}`, body).then((r) => r.data),

  update: (id: number, body: TaskRequest) =>
    api.patch<Task>(`/api/v1/tasks/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/api/v1/tasks/${id}`).then(() => undefined),
};
