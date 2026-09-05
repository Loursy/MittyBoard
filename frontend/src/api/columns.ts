import { api } from "../lib/api";
import type { TaskColumn, TaskColumnRequest } from "../types";

export const columnsApi = {
  listByBoard: (boardId: number) =>
    api.get<TaskColumn[]>(`/api/v1/columns/boards/${boardId}`).then((r) => r.data),

  create: (boardId: number, body: TaskColumnRequest) =>
    api.post<TaskColumn>(`/api/v1/columns/boards/${boardId}`, body).then((r) => r.data),

  update: (id: number, body: TaskColumnRequest) =>
    api.patch<TaskColumn>(`/api/v1/columns/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/api/v1/columns/${id}`).then(() => undefined),
};
