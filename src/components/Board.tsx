import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, writeBatch, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from './firebaseConfig';
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";
import { Task, TaskStatus } from './types';
import { closestCorners, DndContext, DragOverlay, DragEndEvent, DragMoveEvent, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from "react-toastify";
import DragOverlayComponent from './DragOverlayComponent';
import Modal from './Modal';
import DeleteIcon from "../icons/DeleteIcon";

const defaultStatuses: TaskStatus[] = ["to-do", "doing", "done"];

const Board: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>(defaultStatuses);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newStatusName, setNewStatusName] = useState<string>("");


    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("orderIndex")
        );

        const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
            const tasksArray: Task[] = [];
            querySnapshot.forEach((doc) => {
                const taskData = doc.data() as Task;
                tasksArray.push({
                    ...taskData,
                    id: doc.id,
                });
            });
            setTasks(tasksArray);
            setIsLoading(false);
        }, (error) => {
            console.log("Error fetching tasks:", error);
            setIsLoading(false);
        });

        const statusesQuery = query(
            collection(db, "statuses"),
            where("userId", "==", user.uid)
        );

        const unsubscribeStatuses = onSnapshot(statusesQuery, (querySnapshot) => {
            const statusesArray: TaskStatus[] = [];
            querySnapshot.forEach((doc) => {
                const statusData = doc.data().statusName as TaskStatus;
                statusesArray.push(statusData);
            });
            setStatuses([...defaultStatuses, ...statusesArray]);
        });


        return () => {
            unsubscribeTasks();
            unsubscribeStatuses();
        }
    }, []);

    const addNewStatus = async () => {
        if (statuses.includes(newStatusName.trim())) {
            toast.error("This status already exists!");
            return;
        } else if (newStatusName.trim()) {
            const user = auth.currentUser;
            if (!user) return;

            try {

                await addDoc(collection(db, "statuses"), {
                    userId: user.uid,
                    statusName: newStatusName
                });

                setStatuses([...statuses, newStatusName]);
                setNewStatusName("");
                setIsModalOpen(false);

            } catch (error) {
                console.error("Error adding status:", error);
            }
        } else {
            toast.error("Unexpected behaviour")
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const addTask = async (content: string, status: TaskStatus) => {
        try {
            const user = auth.currentUser;

            if (!user) return;

            const tasksInStatus = tasks.filter(task => task.status === status);
            const orderIndex = tasksInStatus.length;

            const taskData = {
                userId: user.uid,
                content,
                status,
                createdAt: new Date(),
                orderIndex
            };

            await addDoc(collection(db, "tasks"), taskData);
        } catch (error) {
            console.error("Error adding task:", error);
        }

    };

    const deleteStatus = async (statusToDelete: TaskStatus) => {
        toast.success("Container deleted successfully")
        if (defaultStatuses.includes(statusToDelete)) {
            toast.error("Cannot delete default statuses!");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {
            const tasksToDelete = tasks.filter(task => task.status === statusToDelete);
            tasksToDelete.forEach(async (task) => {
                await deleteTask(task.id);
            });

            const statusesQuery = query(
                collection(db, "statuses"),
                where("userId", "==", user.uid),
                where("statusName", "==", statusToDelete)
            );
            const statusSnapshot = await getDocs(statusesQuery);
            statusSnapshot.forEach(async (statusDoc) => {
                await deleteDoc(statusDoc.ref);
            });
            
            const updatedStatuses = statuses.filter(status => status !== statusToDelete);
            setStatuses(updatedStatuses);

        } catch (error) {
            console.error("Error deleting status:", error);
            toast.error("Error deleting status");
        }
    }

    const deleteTask = async (taskId: string) => {
        try {
            const taskDocRef = doc(db, "tasks", taskId);
            await deleteDoc(taskDocRef);
            setTasks(prevTasks => {
                const updatedTasks = prevTasks.filter(task => task.id !== taskId);
                return updatedTasks;
            });
            toast.success("Task deleted successfully", {
                position: "top-right"
            })
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.success("Error deleting task", {
                position: "top-right"
            })
        }
    };

    const handleUpdate = async (taskId: string, newContent: string) => {
        try {
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, content: newContent } : task
            ));
            const taskDocRef = doc(db, "tasks", taskId);
            await updateDoc(taskDocRef, {
                content: newContent,
                updatedAt: new Date(),
            });
            toast.success("Task updated successfully", {
                position: "top-right"
            })
        } catch (error) {
            console.error("Error updating task: ", error);
            toast.success("Error updating task", {
                position: "top-right"
            })
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const activeTask = tasks.find((task) => task.id === event.active.id.toString());
        if (activeTask) {
            setDraggedTask(activeTask);
        }
    };

    const handleDragMove = (event: DragMoveEvent) => { };

    const onDragEnd = async (event: DragEndEvent) => {
        try {
            setDraggedTask(null);
            const { active, over } = event;

            if (!over) return;

            const activeTaskId = active.id.toString();
            const overId = over.id.toString();
            const activeTask = tasks.find((task) => task.id === activeTaskId);
            const currentStatus = overId as TaskStatus;
            const tasksInStatus = tasks.filter(task => task.status === currentStatus);
            const orderIndexStatus = tasksInStatus.length;
            if (!activeTask) return;

            const overTask = tasks.find((task) => task.id === overId);
            const isMovingToEmptyColumn = !overTask;

            let updatedTasks: Task[] = [];
            if (isMovingToEmptyColumn || activeTask.status !== overTask?.status) {

                const newStatus: TaskStatus = isMovingToEmptyColumn ? overId as TaskStatus : overTask.status;

                const newOrderIndex = tasks.filter(task => task.status === newStatus).length;

                updatedTasks = tasks.map((task) => {
                    if (task.id === activeTaskId) {
                        return { ...task, status: newStatus, orderIndex: newOrderIndex };
                    }
                    return task;
                });

                const taskDocRef = doc(db, "tasks", activeTaskId);
                await updateDoc(taskDocRef, {
                    status: newStatus,
                    orderIndex: orderIndexStatus,
                    updatedAt: new Date(),
                });

            } else {

                const reorderedTasks = [...tasks];
                const activeIndex = reorderedTasks.findIndex(task => task.id === activeTaskId);
                const overIndex = reorderedTasks.findIndex(task => task.id === overId);

                reorderedTasks.splice(activeIndex, 1);
                reorderedTasks.splice(overIndex, 0, activeTask);

                const batch = writeBatch(db);
                reorderedTasks.forEach((task, index) => {
                    const taskDocRef = doc(db, "tasks", task.id);
                    batch.update(taskDocRef, { orderIndex: index });
                });
                await batch.commit();
                setTasks(reorderedTasks);
                return;
            }
            setTasks(updatedTasks);

        } catch (error) {
            console.error("Error during drag and drop: ", error);
        }
    };

    const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )
    return (
        <DndContext
            onDragEnd={onDragEnd}
            onDragStart={handleDragStart}
            sensors={useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))}
            collisionDetection={closestCorners}>
            <DragOverlay>
                {draggedTask ? <DragOverlayComponent task={draggedTask} /> : null}
            </DragOverlay>
            <div className="flex flex-col items-center">
                <TaskInput addTask={addTask} statuses={statuses} />
                <div className="sm:w-auto">
                    <button onClick={openModal} className="p-2 ml-0 sm:ml-2 mt-2 sm:mt-0
            bg-gradient-to-r from-pink-600 via-purple-500 to-blue-400 bg-opacity-20 text-white py-2 px-4 rounded-lg font-semibold
            hover:bg-red-100
              hover:border-2 hover:border-l-rose-300 hover:border-r-rose-300
              h-[45px]
              w-full sm:w-auto">Add Container</button>
                </div>
                {isModalOpen && (
                    <Modal closeModal={closeModal}>
                        <div>
                            <h2 className="text-xl font-bold mb-4">Add New Container</h2>
                            <input
                                type="text"
                                value={newStatusName}
                                onChange={(e) => setNewStatusName(e.target.value)}
                                className="p-2 border rounded"
                                placeholder="Enter container name"
                            />
                            <button
                                onClick={addNewStatus}
                                className="ml-2 p-2 bg-green-500 text-white rounded"
                                disabled={!newStatusName.trim()}
                            >
                                Add
                            </button>
                        </div>
                    </Modal>
                )}

                <div className="flex flex-wrap justify-center gap-4 py-3">
                    {statuses.map((status) => (
                        <div key={status} className="w-full md:w-auto sm:w-auto flex flex-col items-center mb-4">
                            <DropZone key={status} status={status} deleteStatus={deleteStatus} tasks={getTasksByStatus(status)} isLoading={isLoading} deleteTask={deleteTask} handleUpdate={handleUpdate} />
                        </div>
                    ))}
                </div>
            </div>
        </DndContext>
    );
};

interface DropZoneProps {
    status: TaskStatus;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    handleUpdate: (taskId: string, newContent: string) => void
    isLoading: boolean,
    deleteStatus: (statusToDelete: TaskStatus) => void
}

const DropZone: React.FC<DropZoneProps> = ({ status, tasks, deleteTask, isLoading, handleUpdate, deleteStatus }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });


    return (
        <div
            className="p-4 flex-1 min-h-[250px] min-w-[270px] bg-gray-200 bg-opacity-20 rounded-lg shadow transition-transform duration-200 ease-in-out"

            ref={setNodeRef}
        >
            <div className="flex justify-between">
                <h2 className="text-xl font-bold text-white capitalize">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </h2>
                {!defaultStatuses.includes(status) && (
                    <button
                        onClick={() => deleteStatus(status)}
                        className="ml-2 text-red-500"
                        title="Delete status"
                    >
                        <DeleteIcon />
                    </button>
                )}
            </div>
            <hr className="h-[10px]" />
            {isLoading ? (
                <div className="text-center text-white font-medium py-4">
                    Loading...
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center text-white font-medium py-4">
                    No tasks available
                </div>
            ) : (
                <SortableContext
                    items={tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <TaskList tasks={tasks} deleteTask={deleteTask} handleUpdate={handleUpdate} />
                </SortableContext>
            )}
        </div>
    );
};

export default Board;
