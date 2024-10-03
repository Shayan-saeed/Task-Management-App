import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from './TaskList';
import { Task, TaskStatus } from './types';
import React from 'react';
export interface DropZoneProps {
    id: string;
    status: TaskStatus;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void;
    isLoading: boolean;
    deleteStatus: (statusToDelete: TaskStatus) => void;
    moveTasks: (activeTaskId: string, newStatus: string) => void;
    openTaskModal: (task: Task) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ id, status, tasks, deleteTask, isLoading, handleUpdate, deleteStatus, moveTasks, openTaskModal }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div
            className="flex-1 mt-4"
            ref={setNodeRef}
        >
            {isLoading ? (
                // <div className="text-center text-[#9fadbc] font-medium py-4">
                //     Loading...
                // </div>
                <div className="flex items-center justify-center h-full w-full overflow-y-hidden"> {/* Parent container for centering */}
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span
                            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                        >
                            Loading...
                        </span>
                    </div>
                </div>

            ) : tasks.length === 0 ? (
                <div className="text-center text-[#9fadbc] text-sm pr-4 py-4">
                    No tasks available.
                </div>
            ) : (
                <div className='scrollbar-thin'>
                    <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                        <TaskList id={id} tasks={tasks} deleteTask={deleteTask} handleUpdate={handleUpdate} moveTasks={moveTasks} openTaskModal={openTaskModal} />
                    </SortableContext>
                </div>
            )}
        </div>
    );
};

export default DropZone;
