import DropZone from './DropZone';
import { useSortable } from '@dnd-kit/sortable';
import {useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from './types'
import DeleteIcon from '../icons/DeleteIcon';
import PlusIcon from '../icons/PlusIcon';
import clsx  from 'clsx'
import { useState, useEffect, useRef } from 'react';

interface SortableStatusProps {
    id: string;
    status: string;
    deleteStatus: (status: string) => Promise<void>;
    tasks: Task[];
    isLoading: boolean;
    deleteTask: (taskId: string) => Promise<void>;
    handleUpdate: (taskId: string, newContent: string) => Promise<void>;
    addTaskInStatus: (status: TaskStatus) => Promise<void>;
    moveStatus: (activeStatus: string, overStatus: string) => void;
    moveTasks: (activeTaskId: string, newStatus: string) => void;
}


const SortableStatus: React.FC<SortableStatusProps> = ({ id, status, deleteTask, isLoading, handleUpdate, deleteStatus, tasks, addTaskInStatus, moveStatus, moveTasks }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } = useSortable({ id });
    const [isHolding, setIsHolding] = useState(false);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDraggingRef = useRef(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease',
        opacity: isDragging ? 0.5 : 1
    };

    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id
    });

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
        if (isOver && active?.id !== id) {
            moveStatus(active?.id as string, id);
        }
    }, [active, isOver]);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTaskInStatus(status);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className={clsx("md:w-auto sm:w-auto flex flex-col mb-4 p-4 max-h-[320px] min-w-[270px] bg-[#101204] rounded-xl shadow transition-transform duration-200 ease-in-out" ,
                isDragging && 'opacity-80 scale-105 shadow-lg outline-2 outline-dashed outline-blue-500',
                isOver && 'outline-2 outline-dashed outline-red-500'
            )}
        >
            <div className="flex items-center max-w-[270px] justify-between w-full pb-2 pt-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex-grow cursor-grab outline-none"
                    ref={setDroppableRef}
                >
                    <h2 className="text-lg font-bold text-[#b6c2cf] capitalize outline-none">
                        {status.charAt(0).toUpperCase() + status.slice(1) || "Untitled"}
                    </h2>
                </div>
                <div className="flex">
                    {!["to-do", "doing", "done"].includes(status) && (
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
                    )}
                </div>
            </div>

            <div className='w-full'>
                <p className='text-[#b6c2cf] text-sm'>{tasks.length === 1 || tasks.length === 0 ? `${tasks.length} task matches filters` : `${tasks.length} tasks match filters`}</p>
            </div>
            <div className='flex flex-col items-start justify-between h-full'>
                <div className='w-full max-h-[195px] overflow-x-auto scrollbar-thin'>
                    <DropZone
                        id={id}
                        status={status}
                        deleteTask={deleteTask}
                        isLoading={isLoading}
                        handleUpdate={handleUpdate}
                        deleteStatus={deleteStatus}
                        tasks={tasks}
                        moveTasks={moveTasks}
                    />
                </div>
                <div className="flex mb-4 w-full justify-between mt-2 sm:mt-0">
                    <div onClick={handleSubmit} className="flex text-[#b6c2cf] text-sm h-[45px] sm:w-auto cursor-pointer gap-2 items-center min-w-[200px]">
                        <button><PlusIcon /></button>
                        <button>Add a task</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableStatus;
