import React, { useState, useEffect, useRef } from "react";
import { Task } from './types';
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import DeleteIcon from "../icons/DeleteIcon";
import UpdateIcon from "../icons/UpdateIcon";
import clsx from "clsx"
import SaveIcon from "../icons/SaveIcon";

interface TaskListProps {
    id: string;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void
    moveTasks: (activeTaskId: string, newStatus: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ id, tasks, deleteTask, handleUpdate, moveTasks }) => {
    return (
        <div className="mr-2">
            {tasks.map((task) => (
                <TaskItem key={task.id} id={id} task={task} deleteTask={deleteTask} handleUpdate={handleUpdate} moveTasks={moveTasks} />
            ))}
        </div>
    );
};

interface TaskItemProps {
    id: string;
    task: Task;
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void
    moveTasks: (activeTaskId: string, newStatus: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, task, deleteTask, handleUpdate, moveTasks }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<string>(task.content);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDraggingRef = useRef(false);

    const handleTouchStart = () => {
        holdTimeoutRef.current = setTimeout(() => {
            setIsHolding(true);
            if (listeners)
                if (listeners.onDragStart) {
                    listeners.onDragStart();
                    isDraggingRef.current = true; // Mark as dragging
                }
        }, 300); // 300ms hold to initiate drag
    };

    const handleTouchEnd = () => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
        if (isHolding) {
            // If we were holding, reset the holding state
            setIsHolding(false);
        }
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
        }
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        // Prevent default scrolling behavior while dragging
        event.preventDefault();
        if (listeners)
            if (isHolding && listeners.onDragMove) {
                listeners.onDragStart(event); // Trigger the drag if holding
            }
    };

    useEffect(() => {
        // Clean up the timeout on component unmount
        return () => {
            if (holdTimeoutRef.current) {
                clearTimeout(holdTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setNewContent(task.content);
    }, [task.content]);

    const handleSaveUpdate = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        handleUpdate(task.id, newContent);
        setIsEditing(false);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } = useSortable({
        id: task.id,
        disabled: isButtonClicked,
    });

    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
        opacity: isDragging ? 0.5 : 1
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTask(task.id);
    };

    useEffect(() => {
        if (isOver && active?.id !== task.id) {
            moveTasks(active?.id as string, id);
        }
    }, [active, isOver, moveTasks]);

    useEffect(() => {
        if (isButtonClicked) {
            const timer = setTimeout(() => setIsButtonClicked(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isButtonClicked]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx("p-2 my-2 bg-[#22272b] min-h-[20px] text-[#b6c2cf] cursor-grab rounded-lg text-sm flex justify-between w-full transition-transform duration-300 ease-in-out transform hover:shadow-lg hover:scale-105",
                isDragging && 'opacity-80 scale-105 shadow-lg',
                isOver && ''
            )}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >

            {isEditing ? (
                <input
                    type="text"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="py-1 text-[#b6c2cf] text-sm
                     outline-none
                     rounded
                     p-1
                     bg-gray-100 bg-opacity-20
                     border-none
                     max-w-[250px]
                     sm:w-auto
                     "
                    placeholder="Edit Task"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (!newContent.trim()) return;
                            handleSaveUpdate(e);
                            setIsEditing(false)
                        }
                    }}

                />
            ) : (
                <div
                    ref={setDroppableRef}
                    className="flex-grow cursor-grab overflow-x-auto outline-none font-medium text-[#b6c2cf]"
                    {...attributes}
                    {...listeners}
                >
                    {task.content}
                </div>
            )}
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button
                            className="hover:text-green-500"
                            onClick={(e) => {
                                if (!newContent) return
                                e.stopPropagation()
                                setIsEditing(false)
                                setIsButtonClicked(false)
                                handleUpdate(task.id, newContent)
                            }}
                        >
                            <SaveIcon />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="hover:text-green-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true)
                                console.log("Update icon pressed")
                                setIsButtonClicked(true);
                            }}
                        >
                            <UpdateIcon />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(e);
                                setIsButtonClicked(true);
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
