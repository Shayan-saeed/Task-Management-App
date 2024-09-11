// src/components/TaskList.tsx
import React from "react";
import { Task } from './types';

interface TaskListProps {
  tasks: Task[];
  TaskComponent: React.FC<{ task: Task}>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, TaskComponent }) => {
  return (
    <div>
      {tasks.map((task) => (
        <TaskComponent key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
