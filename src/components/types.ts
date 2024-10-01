export type TaskStatus = "to-do" | "doing" | "done" | string;

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
  orderIndex: number;
  description: string;
  activities: string[];
  createdAt: string;
}
