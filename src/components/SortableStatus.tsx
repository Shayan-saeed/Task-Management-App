import DropZone from './DropZone';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from './types'
import DeleteIcon from '../icons/DeleteIcon';
import PlusIcon from '../icons/PlusIcon';
import clsx from 'clsx'
import React, { useEffect, useCallback, useState } from 'react';
import UpdateIcon from '../icons/UpdateIcon';
import { stat } from 'fs';

interface SortableStatusProps {
    id: string;
    status: string;
    updateStatus: (oldStatus: string, newStatusName: string) => Promise<void>;
    deleteStatus: (status: string) => Promise<void>;
    tasks: Task[];
    isLoading: boolean;
    deleteTask: (taskId: string) => Promise<void>;
    handleUpdate: (taskId: string, newContent: string) => Promise<void>;
    addTaskInStatus: (status: TaskStatus) => Promise<void>;
    moveStatus: (activeStatus: string, overStatus: string) => void;
    moveTasks: (activeTaskId: string, newStatus: string) => void;
    openTaskModal: (task: Task) => void;
}


const SortableStatus: React.FC<SortableStatusProps> = React.memo(({ id, status, deleteTask, isLoading, handleUpdate, deleteStatus, tasks, addTaskInStatus, moveStatus, moveTasks, openTaskModal, updateStatus}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } = useSortable({ id});
    const [newStatusName, setNewStatusName] = useState(status);
    const [isEditing, setIsEditing] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
        opacity: isDragging ? 0.5 : 1
    };

    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: status
    });

    useEffect(() => {
        if (isOver && active?.id !== id) {
            moveStatus(active?.id as string, id);
        }
    }, [active, isOver, id]);


    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        addTaskInStatus(status);
    }, [addTaskInStatus, status]);

    const handleEditSubmit = useCallback(async () => {
        if (newStatusName !== status && newStatusName.trim()) {
            await updateStatus(status, newStatusName.trim());
        }
        setNewStatusName(status)
        setIsEditing(false); 
    }, [newStatusName, status, updateStatus]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === 'Enter') {
            handleEditSubmit();
        }
    }, [handleEditSubmit]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx("md:w-auto sm:w-auto sm:h-auto flex flex-col pr-4 pl-4 pt-4 max-h-[320px] min-w-[279px] max-w-[300] bg-[#101204] rounded-xl shadow transition-transform duration-200 ease-in-out",
                isDragging && 'opacity-80 scale-105 shadow-lg outline-2 outline-dashed outline-blue-500',
                isOver && 'outline-2 outline-dashed outline-red-500'
            )}
        >
            <div className="flex items-center max-w-[270px] whitespace-nowrap justify-between w-full pb-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex-grow cursor-grab outline-none"
                    ref={setDroppableRef}
                >
                    {isEditing ? (
                        <input
                            type="text"
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            onBlur={handleEditSubmit} 
                            onKeyDown={handleKeyDown} 
                            className="max-w-[200px] text-lg font-bold text-[#b6c2cf] bg-transparent border-b border-dashed border-blue-500 outline-none"
                            autoFocus
                        />
                    ) : (
                        <h2
                            className="text-lg font-bold text-[#b6c2cf] capitalize outline-none"
                            onDoubleClick={() => setIsEditing(true)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1) || "Untitled"}
                        </h2>
                    )}
                </div>
                <div className="flex">
                    {/* {!["to-do", "doing", "done"].includes(status) && ( */}
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="ml-2 text-blue-400"
                                title="Edit status"
                            >
                                <UpdateIcon /> 
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStatus(status);
                                }}
                                className="ml-2 text-red-400"
                                title="Delete status"
                            >
                                <DeleteIcon />
                            </button>
                        </>
                    {/* )} */}
                </div>
            </div>
            <div className='w-full'>
                <p className='text-[#b6c2cf] text-sm'>{tasks.length === 1 || tasks.length === 0 ? `${tasks.length} task matches filters` : `${tasks.length} tasks match filters`}</p>
            </div>
            <div className='flex flex-col items-start justify-between h-full'>
                <div className='w-full h-auto max-h-[195px] min-h-[195px] overflow-x-auto scrollbar-thin'>
                    <DropZone
                        id={id}
                        status={status}
                        deleteTask={deleteTask}
                        isLoading={isLoading}
                        handleUpdate={handleUpdate} 
                        tasks={tasks}
                        moveTasks={moveTasks}
                        openTaskModal={openTaskModal}
                    />
                </div>
                <div className="flex w-full justify-between my-2 sm:mt-0">
                    <div onClick={handleSubmit} className="flex text-[#b6c2cf] text-sm h-[45px] sm:w-auto cursor-pointer gap-2 items-center min-w-[200px]">
                        <button><PlusIcon /></button>
                        <button>Add a task</button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SortableStatus;
