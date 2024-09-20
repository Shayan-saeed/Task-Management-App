// src/components/TaskInput.tsx
import React, { useState } from "react";
import { TaskStatus } from "./types";

interface TaskInputProps {
  addTask: (content: string, status: TaskStatus) => void;
  statuses: TaskStatus[];
}

const TaskInput: React.FC<TaskInputProps> = ({ addTask, statuses }) => {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<TaskStatus>("to-do");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addTask(content, status);
      setContent("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col sm:flex-row sm:items-center">
        <div className="flex rounded-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[45px] 
        w-full sm:w-auto min-w-[150px]
        bg-gray-100 bg-opacity-50
        cursor-pointor
        rounded-l-lg
        text-white
        p-4
        outline-none
        placeholder:text-white
      placeholder:font-semibold
        "
              placeholder="Enter task"
            />
          </div>
          <div className="w-[1px] bg-gray-300 h-[45px]" />
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="border-l-0
            rounded-r-lg
            sm:rounded-r-lg h-[45px] 
            cursor-pointer 
            bg-gray-100 bg-opacity-50 outline-none
            px-4
            text-center
            "
            >
              {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="p-2 ml-0 sm:ml-2 mt-2 sm:mt-0
        bg-gray-100 bg-opacity-20 text-white py-2 px-4 rounded-lg font-semibold
        hover:bg-red-100
        hover:bg-opacity-50
        h-[45px]
        w-full sm:w-auto md:w-auto
        "
        >
          Add Task
        </button>
      </form >

    </div>
  );
};

export default TaskInput;
