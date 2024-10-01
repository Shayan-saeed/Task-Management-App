import React, { useState, useEffect, useCallback } from "react";
import { auth, database } from './firebaseConfig';
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
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from "react-toastify";
import DragOverlayComponent from './DragOverlayComponent';
import Modal from './modals/Modal';
import PlusIcon from "../icons/PlusIcon";
import SortableStatus from "./SortableStatus";
import { ref, set, get, onValue, remove, update, push } from "firebase/database";
import TaskModal from "./modals/TaskModal";

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
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false); 
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);


    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userTasksRef = ref(database, `tasks/${user.uid}`);
        const userStatusesRef = ref(database, `statuses/${user.uid}`);

        const unsubscribeTasks = onValue(userTasksRef, (snapshot) => {
            const tasksArray: Task[] = [];
            snapshot.forEach((childSnapshot) => {
                const taskData = childSnapshot.val();
                tasksArray.push({ ...taskData, id: childSnapshot.key as string });
            });

            tasksArray.sort((a, b) => a.orderIndex - b.orderIndex);
            setTasks(tasksArray);
            setIsLoading(false);
        }, (error) => {
            console.log("Error fetching tasks:", error);
            setIsLoading(false);
        });

        const unsubscribeStatuses = onValue(userStatusesRef, (snapshot) => {
            if (!snapshot.exists()) {
                const updates = defaultStatuses.reduce((acc, status, index) => {
                    acc[status] = { statusName: status, orderIndex: index };
                    return acc;
                }, {} as Record<string, { statusName: string; orderIndex: number }>);
                set(userStatusesRef, updates);
                setStatuses(defaultStatuses);
            } else {
                const statusesArray: TaskStatus[] = [];
                snapshot.forEach((childSnapshot) => {
                    const statusData = childSnapshot.val();
                    statusesArray.push(statusData.statusName);
                });

                statusesArray.sort((a, b) => {
                    const indexA = snapshot.child(a).val().orderIndex;
                    const indexB = snapshot.child(b).val().orderIndex;
                    return indexA - indexB;
                });

                setStatuses(statusesArray);
            }
        });

        return () => {
            unsubscribeTasks();
            unsubscribeStatuses();
        };
    }, []);

    const addNewStatus = useCallback(async () => {
        if (statuses.includes(newStatusName.trim())) {
            toast.error("This status already exists!");
            return;
        } else if (newStatusName.trim()) {
            const user = auth.currentUser;
            if (!user) return;

            try {
                await set(ref(database, `statuses/${user.uid}/${newStatusName.trim()}`), {
                    statusName: newStatusName.trim(),
                    orderIndex: statuses.length,
                });

                setNewStatusName("");
                setIsModalOpen(false);
            } catch (error) {
                console.error("Error adding status:", error);
            }
        } else {
            toast.error("Unexpected behavior");
        }
    }, [newStatusName, statuses]);

    const openModal = (rect: DOMRect) => {
        setButtonRect(rect);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setButtonRect(null);
    };

    const openTaskModal = (task: Task) => {
        setSelectedTask(task)
        setIsTaskModalOpen(true);
    }

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };


    const addTaskInStatus = async (status: TaskStatus) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const tasksInStatus = tasks.filter(task => task.status === status);
            const orderIndex = tasksInStatus.length;

            const taskId = `${status}-${Date.now()}`;

            const taskData = {
                userId: user.uid,
                content: `Task ${orderIndex + 1}`,
                status,
                createdAt: new Date().toISOString(),
                orderIndex
            };

            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await set(taskRef, taskData);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const addTask = useCallback(async (content: string, status: TaskStatus) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const tasksInStatus = tasks.filter(task => task.status === status);
            const orderIndex = tasksInStatus.length;

            const taskId = `${status}-${Date.now()}`;
            const taskData = {
                userId: user.uid,
                content,
                status,
                createdAt: new Date().toISOString(),
                orderIndex
            };

            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await set(taskRef, taskData);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }, [tasks]);

    const deleteStatus = useCallback(async (statusToDelete: TaskStatus) => {
        if (defaultStatuses.includes(statusToDelete)) {
            toast.error("Cannot delete default statuses!");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {

            const tasksSnapshot = await get(ref(database, `tasks/${user.uid}`));
            const allTasks = tasksSnapshot.val() || {};

            const tasksToDelete = Object.keys(allTasks).filter(taskId => allTasks[taskId].status === statusToDelete);

            if (tasksToDelete.length > 0) {
                const deleteTasksPromises = tasksToDelete.map(taskId =>
                    remove(ref(database, `tasks/${user.uid}/${taskId}`))
                );
                await Promise.all(deleteTasksPromises);
            }

            await remove(ref(database, `statuses/${user.uid}/${statusToDelete}`));

            const updatedStatuses = statuses.filter(status => status !== statusToDelete);
            setStatuses(updatedStatuses);
            toast.success("Status deleted successfully!");
        } catch (error) {
            console.error("Error deleting status:", error);
            toast.error("Error deleting status");
        }
    }, [statuses]);


    const deleteTask = async (taskId: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await remove(taskRef);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            toast.success("Task deleted successfully", { position: "top-right" });
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Error deleting task", { position: "top-right" });
        }
    };

    const saveActivity = async (taskId: string, newActivity: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
    
            const taskRef = ref(database, `tasks/${user.uid}/${taskId}/activities`);
    
            const newActivityRef = push(taskRef);
            await set(newActivityRef, newActivity);
    
            console.log("Activity saved successfully!");
        } catch (error) {
            console.error("Error saving activity:", error);
        }
    };

    const saveDescription = async (taskId: string, newDescription: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await update(taskRef, { description: newDescription }); 
            console.log("Description updated successfully!");
        } catch (error) {
            console.error("Error updating description:", error);
        }
    };

    const handleUpdate = async (taskId: string, newContent: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await update(taskRef, {
                content: newContent,
                updatedAt: new Date().toISOString(),
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, content: newContent } : task)));
            toast.success("Task updated successfully", { position: "top-right" });
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Error updating task", { position: "top-right" });
        }
    };

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const activeId = event.active.id.toString();

        const activeTask = tasks.find(task => task.id === activeId);
        if (activeTask) {
            setDraggedTask(activeTask);
            setDraggedStatus(null);
        } else {
            const activeStatus = statuses.find(status => status === activeId);
            if (activeStatus) {
                const statusTasks = tasks.filter(task => task.status === activeStatus);
                setDraggedStatus({ status: activeStatus, tasks: statusTasks });
                setDraggedTask(null);
            }
        }
    }, [tasks, statuses]);


    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTaskId = active.id.toString();
        const activeTask = tasks.find(task => task.id === activeTaskId);

        if (!activeTask) return;

        const overTask = tasks.find(task => task.id === over.id.toString());
        const isMovingToEmptyColumn = !overTask;

        const user = auth.currentUser;
        if (!user) return;

        if (isMovingToEmptyColumn || activeTask.status !== overTask?.status) {

            const newStatus: TaskStatus = isMovingToEmptyColumn ? over.id.toString() : overTask.status;
            const tasksSnapshot = await get(ref(database, `tasks/${user.uid}/${newStatus}`));
            const newOrderIndex = tasksSnapshot.val() ? Object.keys(tasksSnapshot.val()).length : 0;


            await update(ref(database, `tasks/${user.uid}/${activeTaskId}`), {
                status: newStatus,
                orderIndex: newOrderIndex,
                updatedAt: new Date().toISOString(),
            });

            setDraggedTask(null);
        } else {

            const reorderedTasks = [...tasks];
            const activeIndex = reorderedTasks.findIndex(task => task.id === activeTaskId);
            const overIndex = reorderedTasks.findIndex(task => task.id === over.id.toString());


            const [movedTask] = reorderedTasks.splice(activeIndex, 1);
            reorderedTasks.splice(overIndex, 0, movedTask);


            const batchUpdates = reorderedTasks.map((task, index) =>
                update(ref(database, `tasks/${user.uid}/${task.id}`), { orderIndex: index })
            );

            await Promise.all(batchUpdates);
            setTasks(reorderedTasks);
        }
        setDraggedStatus(null)
        setDraggedTask(null)
    }, [tasks]);

    const moveTasks = async (activeTaskId: string, newStatus: string) => {

        const user = auth.currentUser;
        if (!user) return;

        const activeTaskSnapshot = await get(ref(database, `tasks/${user.uid}/${activeTaskId}`));
        const activeTask = activeTaskSnapshot.val();
        if (!activeTask) return;

        const isMovingToEmptyColumn = !(await get(ref(database, `tasks/${user.uid}/${newStatus}`))).val();
        const currentStatus = activeTask.status;

        const newStatusToSet = isMovingToEmptyColumn ? newStatus : currentStatus;

        const tasksSnapshot = await get(ref(database, `tasks/${user.uid}/${newStatusToSet}`));
        const newOrderIndex = tasksSnapshot.val() ? Object.keys(tasksSnapshot.val()).length : 0;

        await update(ref(database, `tasks/${user.uid}/${activeTaskId}`), {
            status: newStatusToSet,
            orderIndex: newOrderIndex,
            updatedAt: new Date().toISOString(),
        });
    };

    const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

    const moveStatus = async (activeStatus: string, overStatus: string) => {
        const newStatuses = [...statuses];
        const activeIndex = newStatuses.findIndex(status => status === activeStatus);
        const overIndex = newStatuses.findIndex(status => status === overStatus);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            const [movedStatus] = newStatuses.splice(activeIndex, 1);
            newStatuses.splice(overIndex, 0, movedStatus);

            const user = auth.currentUser;
            if (!user) return;

            try {
                await Promise.all(newStatuses.map((status, index) =>
                    update(ref(database, `statuses/${user.uid}/${status}`), { orderIndex: index })
                ));

                setStatuses(newStatuses);
            } catch (error) {
                console.error("Error swapping status order:", error);
            }
        }
    };

    const handleStatusDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const newStatuses = [...statuses];
        const activeIndex = newStatuses.findIndex(status => status === active.id.toString());
        const overIndex = newStatuses.findIndex(status => status === over.id.toString());


        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {

            const [movedStatus] = newStatuses.splice(activeIndex, 1);

            newStatuses.splice(overIndex, 0, movedStatus);

            const user = auth.currentUser;
            if (!user) return;

            try {

                await Promise.all(newStatuses.map((status, index) =>
                    update(ref(database, `statuses/${user.uid}/${status}`), { orderIndex: index })
                ));

                setStatuses(newStatuses);
            } catch (error) {
                console.error("Error swapping status order:", error);
            }
        }
        setDraggedStatus(null);
        setDraggedTask(null);
    }, [statuses]);

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
            <DragOverlay dropAnimation={null}>
                {draggedTask ? (
                    <DragOverlayComponent task={draggedTask} />
                ) : null}
                {draggedStatus ? (
                    <SortableStatus
                        key={draggedStatus.status}
                        id={draggedStatus.status}
                        status={draggedStatus.status}
                        deleteStatus={deleteStatus}
                        tasks={getTasksByStatus(draggedStatus.status)}
                        isLoading={isLoading}
                        deleteTask={deleteTask}
                        handleUpdate={handleUpdate}
                        addTaskInStatus={addTaskInStatus}
                        moveStatus={moveStatus}
                        moveTasks={moveTasks}
                        openTaskModal={openTaskModal}
                    />
                ) : null
                }
            </DragOverlay>
            <div className="flex flex-col overflow-y-auto">
                <div className="flex flex-col justify-around sm:flex-row w-full">
                    <div className="flex justify-center w-full sm:w-auto">
                        <TaskInput addTask={addTask} statuses={statuses} />
                    </div>
                </div>
                {isModalOpen && buttonRect && (
                    <Modal closeModal={closeModal} rect={buttonRect}>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={newStatusName}
                                onChange={(e) => setNewStatusName(e.target.value)}
                                className="p-2.5 border rounded-md text-[#b6c2cf] bg-[#22272b] h-[32px] min-w-[256px] w-full text-sm focus:ring-blue-500 focus:border-blue-300 outline-none border-gray-500"
                                autoFocus
                                placeholder="Enter list name..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addNewStatus();
                                    }
                                }}
                            />
                            <div className="pt-2 pb-2 md:block inline-flex flex-grow items-center justify-center space-x-2">
                                <button
                                    onClick={addNewStatus}
                                    disabled={!newStatusName.trim()}
                                    className="bg-[#579dff] hover:bg-blue-400 font-bold rounded-md h-[32px] cursor-pointer w-[72.53px] text-sm text-[#2d4361]"
                                >
                                    Add list
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="text-[#b6c2cf] h-[32px] w-[32px] text-center rounded-sm p-1 pt-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
                {isTaskModalOpen && selectedTask && (
                    <TaskModal
                    closeTaskModal={closeTaskModal} 
                    taskDescription={selectedTask.description || ""} 
                    activities={selectedTask.activities || []} 
                    taskContent={selectedTask.content} 
                    TaskStatus={selectedTask.status} 
                    taskId={selectedTask.id}  
                    saveDescription={saveDescription} 
                    saveActivity={saveActivity} 
                    createdAt={selectedTask.createdAt}
                    />
                )}
                <div className="flex h-[477px] max-sm:h-full ">
                    <div className="overflow-x-auto scrollbar-thin w-full">
                        <SortableContext items={statuses} strategy={verticalListSortingStrategy}>

                            <div className="flex space-x-4 mx-4 py-3">
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
                                        addTaskInStatus={addTaskInStatus}
                                        moveStatus={moveStatus}
                                        moveTasks={moveTasks}
                                        openTaskModal={openTaskModal}
                                    />
                                ))}
                                <div className="flex mb-4 sm:justify-center mt-2 sm:mt-0">
                                    <div
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            openModal(rect);
                                        }}
                                        className="flex bg-gray-200 bg-opacity-20 text-white py-2 px-2 rounded-xl text-sm font-semibold hover:bg-opacity-50 hover:border-2 hover:border-l-rose-300 hover:border-r-rose-300 h-[45px] sm:w-auto sm:justify-center cursor-pointer gap-2 items-center min-w-[270px]"
                                    >
                                        <button><PlusIcon /></button>
                                        <button>Add another list</button>
                                    </div>
                                </div>
                            </div>
                        </SortableContext>
                    </div>
                </div>
            </div>
        </DndContext >
    );
};

export default Board;