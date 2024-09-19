export type TaskStatus = "to-do" | "doing" | "done" | string;

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
  orderIndex: number;
}
