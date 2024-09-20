import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from './TaskList';
import { Task, TaskStatus } from './types';
import DeleteIcon from "../icons/DeleteIcon";

export interface DropZoneProps {
    status: TaskStatus;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void;
    isLoading: boolean;
    deleteStatus: (statusToDelete: TaskStatus) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ status, tasks, deleteTask, isLoading, handleUpdate, deleteStatus }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div
            className="flex-1 mt-4"
            ref={setNodeRef}
        >
            {isLoading ? (
                <div className="text-center text-white font-medium py-4">
                    Loading...
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center text-white font-medium py-4">
                    No tasks available
                </div>
            ) : (
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <TaskList tasks={tasks} deleteTask={deleteTask} handleUpdate={handleUpdate} />
                </SortableContext>
            )}
        </div>
    );
};

export default DropZone;
