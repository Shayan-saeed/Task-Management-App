// src/components/TaskInput.tsx
import React, { useState } from "react";
import { TaskStatus } from "./types";

interface TaskInputProps {  
  addTask: (content: string, status: TaskStatus) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ addTask }) => {
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
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="h-[45px] 
        w-[350px]
        min-w-[350px]
        cursor-pointor
        rounded-lg
        border-2
        p-4
        ring-rose-500
        hover:ring-2
        outline-none
        focus:ring-rose-500
        focus:ring-2
        "
        placeholder="Enter task"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        className="border rounded p-2 ml-2"
      >
        <option value="to-do">To Do</option>
        <option value="doing">Doing</option>
        <option value="done">Done</option>
      </select>
      <button
        type="submit"
        className="p-2 ml-2
        bg-gray-100 bg-opacity-20 text-white py-2 px-4 rounded-lg
        border-2
        hover:bg-red-100
        hover:bg-opacity-50
        
        "
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;
