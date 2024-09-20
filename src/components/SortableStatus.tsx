import DropZone from './DropZone';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './types'
import DeleteIcon from '../icons/DeleteIcon';

interface SortableStatusProps {
    id: string;
    status: string;
    deleteStatus: (status: string) => Promise<void>;
    tasks: Task[];
    isLoading: boolean;
    deleteTask: (taskId: string) => Promise<void>;
    handleUpdate: (taskId: string, newContent: string) => Promise<void>;
}


const SortableStatus: React.FC<SortableStatusProps> = ({ id, status, deleteTask, isLoading, handleUpdate, deleteStatus, tasks }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-full md:w-auto sm:w-auto flex flex-col items-center mb-4 pl-4 pt-2 pr-2
            min-h-[250px] min-w-[270px] bg-gray-200 bg-opacity-20 rounded-lg shadow transition-transform duration-200 ease-in-out"
        >
            <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-bold text-white capitalize">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </h2>
                <div className='flex gap-4'>
                    {!["to-do", "doing", "done"].includes(status) && (
                        <button
                            onClick={() => deleteStatus(status)}
                            className="ml-2 text-red-500"
                            title="Delete status"
                        >
                            <DeleteIcon />
                        </button>
                    )}
                    <button {...attributes} {...listeners} className="p-2 cursor-grab" title="Drag Status">
                        ☰
                    </button>
                </div>
            </div>
            <div className='w-full'>
                <hr className="w-full bg-gray-400" />
            </div>
            <div className='w-full'>
            <DropZone
                status={status}
                deleteTask={deleteTask}
                isLoading={isLoading}
                handleUpdate={handleUpdate}
                deleteStatus={deleteStatus}
                tasks={tasks}
            />
            </div>
        </div>
    );
};

export default SortableStatus;
