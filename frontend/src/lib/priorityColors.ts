import type { Priority } from "../types";

/** Solid accent colors (for left-border strips, dots, etc.) — not the translucent badge fills. */
export const priorityAccentColor: Record<Priority, string> = {
  LOW: "#64748b",
  MEDIUM: "#38bdf8",
  HIGH: "#f59e0b",
  URGENT: "#f43f5e",
};
