export type TaskStatus = "to-do" | "doing" | "done";

export interface Task {
  id: number;
  content: string;
  status: TaskStatus;
}
