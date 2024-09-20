import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    writeBatch,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import { auth, db } from './firebaseConfig';
import TaskInput from "./TaskInput";
import { Task, TaskStatus } from './types';
import {
    closestCorners,
    DndContext,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { toast } from "react-toastify";
import DragOverlayComponent from './DragOverlayComponent';
import Modal from './Modal';
import PlusIcon from "../icons/PlusIcon";
import SortableStatus from "./SortableStatus";
import DropZone from "./DropZone";

const defaultStatuses: TaskStatus[] = ["to-do", "doing", "done"];

interface DraggedStatus {
    status: string;
    tasks: Task[];
}

const Board: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>(defaultStatuses);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newStatusName, setNewStatusName] = useState<string>("");
    const [draggedStatus, setDraggedStatus] = useState<DraggedStatus | null>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const tasksQuery = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("orderIndex")
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
            const tasksArray: Task[] = [];
            querySnapshot.forEach((doc) => {
                const taskData = doc.data() as Task;
                tasksArray.push({ ...taskData, id: doc.id });
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
            const statusesArray: TaskStatus[] = [...defaultStatuses];
            querySnapshot.forEach((doc) => {
                const statusData = doc.data().statusName as TaskStatus;
                statusesArray.push(statusData);
            });
            setStatuses(statusesArray);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeStatuses();
        };
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
                    statusName: newStatusName,
                    orderIndex: statuses.length
                });

                setStatuses([...statuses, newStatusName]);
                setNewStatusName("");
                setIsModalOpen(false);
            } catch (error) {
                console.error("Error adding status:", error);
            }
        } else {
            toast.error("Unexpected behaviour");
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
            toast.success("Status deleted successfully!");
        } catch (error) {
            console.error("Error deleting status:", error);
            toast.error("Error deleting status");
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const taskDocRef = doc(db, "tasks", taskId);
            await deleteDoc(taskDocRef);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            toast.success("Task deleted successfully", {
                position: "top-right"
            });
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Error deleting task", {
                position: "top-right"
            });
        }
    };

    const handleUpdate = async (taskId: string, newContent: string) => {
        try {
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, content: newContent } : task)));
            const taskDocRef = doc(db, "tasks", taskId);
            await updateDoc(taskDocRef, {
                content: newContent,
                updatedAt: new Date(),
            });
            toast.success("Task updated successfully", {
                position: "top-right"
            });
        } catch (error) {
            console.error("Error updating task: ", error);
            toast.error("Error updating task", {
                position: "top-right"
            });
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = event.active.id.toString();

        const activeTask = tasks.find(task => task.id === activeId);
        if (activeTask) {
            setDraggedTask(activeTask);
        } else {
            const activeStatus = statuses.find(status => status === activeId);
            if (activeStatus) {
                const statusTasks = tasks.filter(task => task.status === activeStatus);
                setDraggedStatus({ status: activeStatus, tasks: statusTasks });
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        try {
            setDraggedTask(null);
            setDraggedStatus(null);

            const { active, over } = event;

            if (!over) return;

            const activeTaskId = active.id.toString();
            const overId = over.id.toString();
            const activeTask = tasks.find(task => task.id === activeTaskId);
            const currentStatus = overId as TaskStatus;
            const tasksInStatus = tasks.filter(task => task.status === currentStatus);
            const orderIndexStatus = tasksInStatus.length;

            if (!activeTask) return;

            const overTask = tasks.find(task => task.id === overId);
            const isMovingToEmptyColumn = !overTask;

            let updatedTasks: Task[] = [];
            if (isMovingToEmptyColumn || activeTask.status !== overTask?.status) {
                const newStatus: TaskStatus = isMovingToEmptyColumn ? overId as TaskStatus : overTask.status;
                const newOrderIndex = tasks.filter(task => task.status === newStatus).length;

                updatedTasks = tasks.map(task => {
                    if (task.id === activeTaskId) {
                        return { ...task, status: newStatus, orderIndex: newOrderIndex };
                    }
                    return task;
                });

                const taskDocRef = doc(db, "tasks", activeTaskId);
                await updateDoc(taskDocRef, {
                    status: newStatus,
                    orderIndex: newOrderIndex,
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

    const handleStatusDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const newStatuses = [...statuses];
        const activeIndex = newStatuses.findIndex(status => status === active.id.toString());
        const overIndex = newStatuses.findIndex(status => status === over.id.toString());

        const [movedStatus] = newStatuses.splice(activeIndex, 1);
        newStatuses.splice(overIndex, 0, movedStatus);
        setStatuses(newStatuses);

        try {
            const batch = writeBatch(db);
            newStatuses.forEach((status, index) => {
                const statusDocRef = doc(db, "statuses", status);
                batch.update(statusDocRef, { orderIndex: index });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error updating status order:", error);
        }
    };

    const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

    return (
        <DndContext
            onDragEnd={event => {
                if (statuses.includes(event.active.id as TaskStatus)) {
                    handleStatusDragEnd(event);
                } else {
                    handleDragEnd(event);
                }
            }}
            onDragStart={handleDragStart}
            sensors={useSensors(
                useSensor(PointerSensor),
                useSensor(KeyboardSensor)
            )}
            collisionDetection={closestCorners}
        >
            <DragOverlay>
                {draggedTask ? (
                    <DragOverlayComponent task={draggedTask} />
                ) : draggedStatus ? (
                    <div className="w-full min-w-[270px] bg-gray-200 rounded-lg p-4">
                        <h2 className="text-xl font-bold text-white capitalize">
                            {draggedStatus.status.charAt(0).toUpperCase() + draggedStatus.status.slice(1)}
                        </h2>
                        <DropZone
                            status={draggedStatus.status}
                            tasks={draggedStatus.tasks}
                            deleteTask={() => {}}
                            handleUpdate={() => {}}
                            isLoading={false}
                            deleteStatus={() => {}}
                        />
                    </div>
                ) : null}
            </DragOverlay>

            <div className="flex flex-col">
                <div className="flex flex-col justify-around sm:flex-row w-full">
                    <div className="flex justify-center w-full sm:w-auto">
                        <TaskInput addTask={addTask} statuses={statuses} />
                    </div>
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
                <SortableContext items={statuses} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-wrap justify-center gap-4 py-3">
                        {statuses.map((status) => (
                            <SortableStatus
                                key={status}
                                id={status}
                                status={status}
                                deleteStatus={deleteStatus}
                                tasks={getTasksByStatus(status)}
                                isLoading={isLoading}
                                deleteTask={deleteTask}
                                handleUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                </SortableContext>
                <div className="flex mb-4 sm:justify-center md:justify-center mt-2 sm:mt-0">
                    <div className="flex mr-2 ml-14 sm:ml-2 mt-2 sm:mt-4
                            bg-gray-200 bg-opacity-20 text-white py-2 px-4 rounded-lg font-semibold
                            hover:bg-opacity-50
                            hover:border-2 hover:border-l-rose-300 hover:border-r-rose-300
                            h-[45px]
                            sm:w-auto sm:justify-center cursor-pointer gap-2 items-center min-w-[200px]">

                        <button onClick={openModal}>
                            Add Container
                        </button>
                        <button onClick={openModal}>
                            <PlusIcon />
                        </button>

                    </div>
                </div>
            </div>
        </DndContext>
    );
};

export default Board;
