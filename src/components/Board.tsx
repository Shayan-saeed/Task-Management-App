import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import { Task, TaskStatus } from "./types";
import UpdateIcon from "../icons/UpdateIcon";
import DeleteIcon from "../icons/DeleteIcon";
import SaveIcon from "../icons/SaveIcon";

const Board: React.FC = () => {


    const [tasks, setTasks] = useState<Task[]>([]);
    const [nextTaskId, setNextTaskId] = useState(1);

    const addTask = (content: string, status: TaskStatus) => {
        setTasks([
            ...tasks,
            { id: nextTaskId, content, status }
        ]);
        setNextTaskId(nextTaskId + 1);
    };

    const deleteTask = (taskId: number) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };
    const moveTask = (taskId: number, newStatus: TaskStatus) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const handleUpdate = (taskId: number, newContent: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, content: newContent } : task
        ));
    };



    const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
        const [isEditing, setIsEditing] = useState<boolean>(false);
        const [newContent, setNewContent] = useState<string>(task.content);
        const [, ref] = useDrag({
            type: 'TASK',
            item: { id: task.id, status: task.status },
        });

         useEffect(() => {
            setNewContent(task.content);
        }, [task.content]);

        const handleSaveUpdate = () => {
            handleUpdate(task.id, newContent);
            setIsEditing(false);
        };

        return (
            <div
                ref={ref}
                className="p-4 my-2 bg-gray-200 bg-opacity-60 cursor-grab font-bold border rounded  flex justify-between"
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className=" py-1 text-white
                        outline-none
                        rounded
                        bg-gray-100 bg-opacity-20
                        border-none
                        "
                        placeholder="Edit Task"
                    />
                ) : (
                    <span>{task.content}</span>
                )}
                <div className="flex gap-2">
                    {isEditing ? (
                        <button
                            className="hover:text-green-500 "
                            onClick={handleSaveUpdate}
                            disabled={!newContent.trim()}
                        >
                            <SaveIcon />
                        </button>
                    ) : (
                        <>
                            <button
                                className="hover:text-green-500"
                                onClick={() => setIsEditing(true)}
                            >
                                <UpdateIcon />
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="hover:text-red-500"
                            >
                                <DeleteIcon />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const DropZone: React.FC<{ status: TaskStatus }> = ({ status }) => {
        const [{ isOver }, drop] = useDrop({
            accept: 'TASK',
            drop: (item: { id: number }) => moveTask(item.id, status),
            collect: monitor => ({
                isOver: !!monitor.isOver(),
            }),
        });

        return (
            <div
                ref={drop}
                className={`p-4 flex-1 bg-gray-100 bg-opacity-20 text-white border rounded shadow`}
            >
                <h2 className="text-lg font-bold">{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                <div>
                    <TaskList
                        tasks={tasks.filter(task => task.status === status)}
                        TaskComponent={TaskItem}
                    />
                </div>

            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col items-center">
                <TaskInput addTask={addTask} />
                <div className="flex w-full max-w-[1000px] overflow-auto gap-4">
                    <DropZone status="to-do" />
                    <DropZone status="doing" />
                    <DropZone status="done" />
                </div>
            </div>
        </DndProvider>
    );
};

export default Board;
