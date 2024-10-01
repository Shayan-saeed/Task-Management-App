import React, { useState, useEffect, useCallback } from "react";
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
    openTaskModal: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ id, tasks, deleteTask, handleUpdate, moveTasks, openTaskModal }) => {
    return (
        <div className="mr-2">
            {tasks.map((task) => (
                <TaskItem key={task.id} id={id} task={task} deleteTask={deleteTask} handleUpdate={handleUpdate} moveTasks={moveTasks} openTaskModal={openTaskModal} />
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
    openTaskModal: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ id, task, deleteTask, handleUpdate, moveTasks, openTaskModal }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<string>(task.content);

    const handleOpenTaskModal = () => {
        openTaskModal(task);
    };

    useEffect(() => {
        setNewContent(task.content);
    }, [task.content]);

    const handleSaveUpdate = useCallback((e: React.KeyboardEvent) => {
        e.stopPropagation();
        handleUpdate(task.id, newContent);
        setIsEditing(false);
    }, [handleUpdate, newContent, task.id]);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } = useSortable({
        id: task.id,
    });

    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
        opacity: isDragging ? 0.5 : 1
    };

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTask(task.id);
    }, [deleteTask, task.id]);

    const handleUpdateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleTaskClick = (e: React.MouseEvent) => {
        if (!isEditing) {
            openTaskModal(task);
        }
    };

    useEffect(() => {
        if (isOver && active?.id !== id) {
            moveTasks(active?.id as string, id);
        }
    }, [active, isOver, moveTasks, id]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx("p-2 py-4 my-2 bg-[#22272b] min-h-[20px] text-[#b6c2cf] cursor-pointer rounded-lg text-sm flex justify-between w-full transition-transform duration-300 ease-in-out transform hover:shadow-lg",
                isDragging && 'opacity-80 scale-105 shadow-lg',
                isOver && ''
            )}
            onClick={handleTaskClick}
        >

            {isEditing ? (
                <input
                    autoFocus
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
                    onClick={(e) => e.stopPropagation()}

                />
            ) : (
                <div
                    ref={setDroppableRef}
                    className="flex-grow cursor-pointer overflow-x-auto outline-none font-medium text-[#b6c2cf]"
                >
                    <div
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleOpenTaskModal}
                    >
                        <div
                        {...attributes}
                        {...listeners}
                        >
                            {task.content}
                        </div>
                        
                        {/* {task.description === "Add a more detailed description..." || null ? null : <span title="This task has a description"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg></span>
                        } */}
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                {isEditing ? (
                    <button
                        className="hover:text-green-500"
                        onClick={(e) => {
                            if (!newContent) return;
                            e.stopPropagation();
                            setIsEditing(false);
                            handleUpdate(task.id, newContent);
                        }}
                    >
                        <SaveIcon />
                    </button>
                ) : (
                    <>
                        <button className="hover:text-green-500" onClick={handleUpdateClick}>
                            <UpdateIcon />
                        </button>
                        <button onClick={handleDelete} className="hover:text-red-500">
                            <DeleteIcon />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default TaskList;
