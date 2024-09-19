import React, { useState, useEffect } from "react";
import { Task } from './types';
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import DeleteIcon from "../icons/DeleteIcon";
import UpdateIcon from "../icons/UpdateIcon";
import SaveIcon from "../icons/SaveIcon";
import clsx from "clsx"

interface TaskListProps {
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void
}

const TaskList: React.FC<TaskListProps> = ({ tasks, deleteTask, handleUpdate }) => {
    return (
        <div>
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} deleteTask={deleteTask} handleUpdate={handleUpdate} />
            ))}
        </div>
    );
};

interface TaskItemProps {
    task: Task;
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, deleteTask, handleUpdate }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<string>(task.content);

    useEffect(() => {
        setNewContent(task.content);
    }, [task.content]);

    const handleSaveUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleUpdate(task.id, newContent);
        setIsEditing(false);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTask(task.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx("p-4 my-2 bg-slate-50 text-black cursor-grab font-bold rounded flex justify-between w-full transition-transform duration-300 ease-in-out transform hover:shadow-lg hover:scale-105",
                isDragging && 'opacity-80 scale-105 shadow-lg outline-2 outline-dashed outline-blue-500',
                isOver && 'outline-2 outline-dashed outline-red-500'
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {isEditing ? (
                <input
                    type="text"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className=" py-1 text-gray-700 font-medium
                     outline-none
                     rounded
                     bg-gray-100 bg-opacity-20
                     border-none
                     min-w-[20px]
                     sm:w-auto 
                     "
                    placeholder="Edit Task"
                />
            ) : (
                <div
                    ref={setDroppableRef}
                    className="flex-grow cursor-grab overflow-x-auto font-medium text-gray-900"
                    {...attributes}
                    {...listeners}
                >
                    {task.content}
                </div>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true)
                            }}
                        >
                            <UpdateIcon />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(e);
                            }}
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



export default TaskList;
