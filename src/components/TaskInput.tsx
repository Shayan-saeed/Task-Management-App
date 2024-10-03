// src/components/TaskInput.tsx
import React, { useState, useEffect } from "react";
import { TaskStatus } from "./types";

interface TaskInputProps {
  addTask: (content: string, status: TaskStatus) => void;
  statuses: TaskStatus[];
}

const TaskInput: React.FC<TaskInputProps> = ({ addTask, statuses }) => {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<TaskStatus>("to-do");
  const [selectWidth, setSelectWidth] = useState(0);

  const calculateWidth = (text: string): number => {
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "nowrap";
    span.style.font = "inherit";
    span.innerText = text;
    document.body.appendChild(span);
    const width = span.clientWidth;
    document.body.removeChild(span);
    return width;
  };

  useEffect(() => {
    const newWidth = calculateWidth(status.charAt(0).toUpperCase() + status.slice(1) || "untitled");
    setSelectWidth(newWidth + 50);
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addTask(content, status);
      setContent("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 w-auto flex flex-col sm:flex-row sm:items-center">
        <div className="flex w-auto rounded-lg">
          <div className="relative w-auto">
            <input
              id="content"
              name="content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[45px] 
              w-full sm:w-auto min-w-[150px]
              bg-gray-100 bg-opacity-50
              cursor-pointer
              rounded-l-lg
              text-white
              p-4
              outline-none
              placeholder:text-white
              placeholder:font-normal
              font-semibold
              "
              placeholder="Enter task"
            />
          </div>
          <div className="w-[1px] bg-gray-300 h-[45px]" />
          <div className="relative w-auto">
            <div className="flex">
              <select
                id="dropdown "
                name="dropdown"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="block appearance-none font-medium border-l-0 rounded-r-lg sm:rounded-r-lg h-[45px] 
                cursor-pointer 
                bg-gray-100 bg-opacity-50 outline-none
                px-4 text-center"
                style={{ width: selectWidth > 150 ? selectWidth : 100 }} 
              >
                {statuses.map((status) => (
                  <option  key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1) || "untitled"}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="p-2 ml-0 sm:ml-2 mt-2 sm:mt-0
          bg-gray-100 bg-opacity-20 text-white py-2 px-4 rounded-lg font-semibold
          hover:shadow-lg
          hover:bg-red-100
          hover:bg-opacity-50
          h-[45px]
          w-full sm:w-auto md:w-auto"
        >
          Add Task
        </button>
      </form>
    </div>
  );
};

export default TaskInput;
