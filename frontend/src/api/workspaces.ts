import { api } from "../lib/api";
import type { Workspace, WorkspaceRequest } from "../types";

export const workspacesApi = {
  list: () => api.get<Workspace[]>("/api/v1/workspaces").then((r) => r.data),

  create: (body: WorkspaceRequest) =>
    api.post<Workspace>("/api/v1/workspaces", body).then((r) => r.data),

  update: (id: number, body: WorkspaceRequest) =>
    api.patch<Workspace>(`/api/v1/workspaces/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/api/v1/workspaces/${id}`).then(() => undefined),
};
