import type { Task } from "../types";

export interface TaskStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

export function taskStats(tasks: Task[]): TaskStats {
  let done = 0;
  let inProgress = 0;
  for (const task of tasks) {
    if (task.status === "DONE") done++;
    else if (task.status === "IN_PROGRESS") inProgress++;
  }
  return { total: tasks.length, done, inProgress, todo: tasks.length - done - inProgress };
}
