// types.ts
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
}

export interface ColumnType {
  id: string;
  title: string;
  tasks: Task[];
}