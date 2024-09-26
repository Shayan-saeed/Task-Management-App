import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from './TaskList';
import { Task, TaskStatus } from './types';
import React, {useEffect} from 'react';
export interface DropZoneProps {
    id: string;
    status: TaskStatus;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void;
    isLoading: boolean;
    deleteStatus: (statusToDelete: TaskStatus) => void;
    moveTasks: (activeTaskId: string, newStatus: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ id, status, tasks, deleteTask, isLoading, handleUpdate, deleteStatus, moveTasks }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });
    
    return (
        <div
            className="flex-1 mt-4"
            ref={setNodeRef}
        >
            {isLoading ? (
                <div className="text-center text-[#9fadbc] font-medium py-4">
                    Loading...
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center text-[#9fadbc] text-sm pr-4 py-4">
                    No tasks available.
                </div>
            ) : (
                <div className='scrollbar-thin'>
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <TaskList id={id} tasks={tasks} deleteTask={deleteTask} handleUpdate={handleUpdate} moveTasks={moveTasks} />
                </SortableContext>
                </div>
            )}
        </div>
    );
};

export default DropZone;
