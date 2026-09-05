export type Role = "USER" | "ADMIN";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
}

export interface WorkspaceRequest {
  name?: string;
  description?: string;
}

export interface Board {
  id: number;
  title: string;
  workspaceId: number;
  createdAt: string;
}

export interface BoardRequest {
  title?: string;
  workspaceId?: number;
}

export interface TaskColumn {
  id: number;
  title: string;
  position: number;
  boardId: number;
  createdAt: string;
}

export interface TaskColumnRequest {
  title?: string;
  position?: number;
  boardId?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  columnId: number;
  position: number;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
}

export interface TaskRequest {
  title?: string;
  description?: string;
  columnId?: number;
  position?: number;
  priority?: Priority;
  status?: TaskStatus;
}
