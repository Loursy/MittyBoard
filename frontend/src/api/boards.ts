import { api } from "../lib/api";
import type { Board, BoardRequest } from "../types";

export const boardsApi = {
  listByWorkspace: (workspaceId: number) =>
    api.get<Board[]>(`/api/v1/boards/workspaces/${workspaceId}`).then((r) => r.data),

  create: (workspaceId: number, body: BoardRequest) =>
    api.post<Board>(`/api/v1/boards/workspaces/${workspaceId}`, body).then((r) => r.data),

  update: (id: number, body: BoardRequest) =>
    api.patch<Board>(`/api/v1/boards/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/api/v1/boards/${id}`).then(() => undefined),
};
