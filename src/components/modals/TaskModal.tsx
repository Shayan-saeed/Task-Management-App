import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import { getAuth } from "firebase/auth";
import { getInitials } from "../../utils/getInitials";
import { database } from '../firebaseConfig';
import { ref, onValue, remove, set } from "firebase/database";


interface TaskModalProps {
    closeTaskModal: () => void;
    taskContent: string;
    TaskStatus: string;
    taskId: string;
    taskDescription: string;
    activities: string[];
    saveDescription: (taskId: string, newDescription: string) => Promise<void>;
    saveActivity: (taskId: string, newActivity: string) => Promise<void>;
    createdAt: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ closeTaskModal, TaskStatus, taskId, taskContent, saveDescription, taskDescription, saveActivity, activities: initialActivities = [], createdAt }) => {
    const editor = useRef(null);
    const [content, setContent] = useState<string>(taskDescription || "");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [activities, setActivities] = useState<string[]>(initialActivities);
    const [newActivity, setNewActivity] = useState<string>("");
    const [isActivityEditorOpen, setActivityEditorOpen] = useState(false);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const createdDate = new Date(createdAt)
    const [watching, setWatching] = useState<boolean>(false)
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editedComment, setEditedComment] = useState<string>("");

    const auth = getAuth();
    const user = auth.currentUser;
    let initials = '';

    if (user && user.displayName) {
        initials = getInitials(user.displayName);
    }

    const formattedDate = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = createdDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const editorConfig = {
        theme: "dark",
        readonly: false,
        height: 300,
        width: 530,
        toolbarSticky: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        buttons: ["bold", "italic", "underline", "ul", "ol", "font", "link", "undo", "redo", "image", "justify"],
        style: {
            backgroundColor: "#22272b",
            color: "#b6c2cf",
            padding: "15px",
            fontSize: "small",
        },
        disablePlugins: [
            "ordered-list", "about", "add-new-line", "ai-assistant", "backspace", "class-span", "clean-html",
            "clipboard", "color", "copyformat", "delete-command", "drag-and-drop", "drag-and-drop-element",
            "dtd", "enter", "file", "focus", "font", "format-block", "hotkeys", "hr", "iframe",
            "image-processor", "image-properties", "indent", "inline-popup", "key-arrow-outside", "limit",
            "line-height", "mobile", "xpath", "wrap-nodes", "video", "table-keyboard-navigation", "table",
            "tab", "symbols", "sticky", "stat", "spellcheck", "speech-recognize", "source", "select-cells", "select", "powered-by-jodit", "preview", "print", "redo-undo", "resize-cells",
            "resize-handler", "resizer", "search", "paste", "paste-from-word", "paste-storage",
            "media", "fullsize"
        ],
    };


    const activityEditorConfig = {
        theme: "dark",
        readonly: false,
        height: 100,
        width: 470,
        toolbarSticky: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        buttons: ["bold", "italic", "underline", "ul", "ol", "font", "link", "undo", "redo", "image", "justify"],
        style: {
            backgroundColor: "#22272b",
            color: "#b6c2cf",
            padding: "15px",
            fontSize: "small",
        },
        disablePlugins: [
            "ordered-list", "about", "add-new-line", "ai-assistant", "backspace", "class-span", "clean-html",
            "clipboard", "color", "copyformat", "delete-command", "drag-and-drop", "drag-and-drop-element",
            "dtd", "enter", "file", "focus", "font", "format-block", "hotkeys", "hr", "iframe",
            "image-processor", "image-properties", "indent", "inline-popup", "key-arrow-outside", "limit",
            "line-height", "mobile", "xpath", "wrap-nodes", "video", "table-keyboard-navigation", "table",
            "tab", "symbols", "sticky", "stat", "spellcheck", "speech-recognize", "source", "select-cells", "select", "powered-by-jodit", "preview", "print", "redo-undo", "resize-cells",
            "resize-handler", "resizer", "search", "paste", "paste-from-word", "paste-storage",
            "media", "fullsize"
        ],
    };

    useEffect(() => {
        setActivities(initialActivities);
    }, [initialActivities]);


    useEffect(() => {
        setContent(taskDescription || "");
    }, [taskDescription]);

    const isContentEmpty = (content: string) => {
        const strippedContent = content.replace(/<\/?p>|<br\s*\/?>/gi, "").trim();
        return strippedContent === "";
    };

    const toggleActivityEditor = () => {
        setActivityEditorOpen(!isActivityEditorOpen);
    };

    const handleWatching = () => {
        setWatching(!watching)
    }

    const showDetailsContainer = () => {
        setShowDetails(!showDetails)
    }

    const handleSaveActivity = async () => {

        if (!newActivity.trim()) return;
        try {
            await saveActivity(taskId, newActivity);

            const user = auth.currentUser;
            if (!user) return;

            const taskRef = ref(database, `tasks/${auth.currentUser.uid}/${taskId}/activities`);
            onValue(taskRef, (snapshot) => {
                const updatedActivities = snapshot.val();
                const activitiesArray = updatedActivities ? Object.values(updatedActivities) as string[] : [];

                setActivities([]);
                setTimeout(() => {
                    setActivities(activitiesArray);
                }, 0);
            });
            setNewActivity("");
            toggleActivityEditor()
        } catch (error) {
            console.error("Error saving activity:", error);
        }
    };

    const handleDeleteActivity = async (activityIndex: number) => {
        try {

            const user = auth.currentUser;
            if (!user) return;

            const activityRef = ref(database, `tasks/${user.uid}/${taskId}/activities/${activityIndex}`);
            await remove(activityRef);

            const taskRef = ref(database, `tasks/${user.uid}/${taskId}/activities`);
            onValue(taskRef, (snapshot) => {
                const updatedActivities = snapshot.val();
                const activitiesArray = updatedActivities ? Object.values(updatedActivities) as string[] : [];

                setActivities(activitiesArray);

            });
        } catch (error) {
            console.error("Error deleting activity:", error);
        }
    };

    const startEditing = (index: number, currentComment: string) => {
        setEditIndex(index); // Set the index of the comment being edited
        setEditedComment(currentComment); // Load the current comment content into the editor
    };

    const handleSaveEditedComment = async (index: number) => {
        if (!editedComment.trim()) return;
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Update the specific comment in Firebase
            const activityRef = ref(database, `tasks/${user.uid}/${taskId}/activities/${index}`);
            await set(activityRef, editedComment); // Overwrite the existing comment with the edited version

            // Update the local state
            setActivities((prevActivities) => {
                const updatedActivities = [...prevActivities];
                updatedActivities[index] = editedComment; // Update the specific comment
                return updatedActivities;
            });

            // Reset editing mode
            setEditIndex(null);
            setEditedComment("");

        } catch (error) {
            console.error("Error saving edited comment:", error);
        }
    };


    const handleSave = async () => {
        await saveDescription(taskId, content);
        setIsEditing(false);
    };

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    const toggleDescriptionEditor = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="fixed inset-0 overflow-y-auto scrollbar-thin flex items-center pt-12 pb-12 justify-center bg-black bg-opacity-75 z-50"
            onClick={closeTaskModal}
        >
            <div
                onClick={handleContentClick}
                className="bg-[#323940] overflow-y-auto text-[#b6c2cf] w-[768px] min-h-[600px] max-h-[i60px] rounded-xl relative mx-auto my-auto shadow-lg"
            >
                <div className="w-full flex justify-between items-center relative z-1 pt-5 pr-5 pl-5">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-start h-[42px]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                            </svg>

                        </span>

                        <div className="flex-1">
                            <h2 className="tracking-wide text-xl font-semibold">{taskContent}</h2>
                            <p className="text-sm text-[#b6c2cf]">
                                In list <span className="underline">{TaskStatus.charAt(0).toUpperCase() + TaskStatus.slice(1)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="ml-auto">
                        <button
                            className="text-[#b6c2cf] h-[32px] w-[32px] text-center rounded-sm hover:bg-gray-700 transition-all duration-200"
                            onClick={closeTaskModal}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex w-full flex-col md:flex-row rounded-lg">
                    <div className="flex-1 p-5">
                        <div className="ml-8 mt-4">
                            <h3 className="text-xs">Notifications</h3>
                            <button
                                onClick={handleWatching}
                                title="Watch card"
                                className="flex items-center font-semibold min-w-[92px] w-auto text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5.25 12 5.25s8.268 2.693 9.542 6.75c-1.274 4.057-5.064 6.75-9.542 6.75S3.732 16.057 2.458 12z" />
                                    </svg>
                                </span>
                                {watching ? <div className="flex gap-2 items-center">
                                    Watching
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div> : "Watch"}

                            </button>
                        </div>

                        <div className="mt-7">
                            <div className="flex items-center">
                                <span className="">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </span>
                                <h3 className="flex-1 text-sm font-bold ml-2">Description</h3>
                                {isEditing ? null :
                                    <button
                                        onClick={toggleDescriptionEditor}
                                        className="bg-[#3c454d] hover:bg-gray-600 font-bold rounded-sm h-[32px] cursor-pointer w-[50px] text-sm mt-3"
                                    >
                                        Edit
                                    </button>
                                }
                            </div>
                            {isEditing ? (
                                <div className="mt-3">
                                    <JoditEditor
                                        ref={editor}
                                        value={content}
                                        config={editorConfig}
                                        onBlur={newContent => setContent(newContent)}
                                        onChange={newContent => { }}
                                    />
                                    <button
                                        onClick={handleSave}
                                        className="bg-[#579dff] hover:bg-blue-400 font-bold rounded-sm h-[32px] cursor-pointer w-[50px] text-sm text-[#2d4361]"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={toggleDescriptionEditor}
                                        className="text-[#b6c2cf] h-[32px] w-[50px] rounded-sm text-sm pl-4 pt-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="w-full text-left text-sm font-semibold bg-[#3c454d] text-[#b6c2cf] mt-2 pb-6 pl-3 pt-2 rounded-[3px] hover:bg-gray-600 relative"
                                        dangerouslySetInnerHTML={{
                                            __html: isContentEmpty(content)
                                                ? "Add a more detailed description..."
                                                : content
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div className="mt-14">
                            <div className="flex flex-around w-full">
                                <div className="flex-1">
                                    <div className="flex items-center pt-3">
                                        <span className="">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                            </svg>
                                        </span>
                                        <h3 className="text-sm font-bold ml-2">Activity</h3>
                                    </div>
                                </div>
                                <div>
                                    <button onClick={showDetailsContainer}
                                        className="flex items-center font-semibold w-full text-left text-sm bg-[#3c454d] mt-2 p-1.5 mb-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                        {showDetails ? "Hide Details" : "Show details"}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-center items-start space-x-2">
                                <div className="bg-[#579dff] text-[#2d4361] w-[32px] h-[32px] rounded-full">
                                    <h3 className="font-semibold text-center pt-1">{initials}</h3>
                                </div>
                                {isActivityEditorOpen ?
                                    <div className="">
                                        <JoditEditor
                                            ref={editor}
                                            value={newActivity}
                                            config={activityEditorConfig}
                                            onBlur={newContent => setNewActivity(newContent)}
                                            onChange={newContent => { }}
                                        />
                                        <button
                                            onClick={handleSaveActivity}
                                            className="bg-[#579dff] hover:bg-blue-400 font-bold rounded-sm h-[32px] cursor-pointer w-[50px] text-sm text-[#2d4361]"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={toggleActivityEditor}
                                            className="text-[#b6c2cf] h-[32px] w-[50px] rounded-sm text-sm pl-4 pt-4"
                                        >
                                            Cancel
                                        </button>
                                    </div> : <button
                                        onClick={toggleActivityEditor}
                                        className="w-full text-left font-extralight text-sm pb-2 pl-3 pt-2 bg-[#22272b] text-[#798794] rounded-lg hover:bg-gray-600"
                                    >
                                        Write a comment...
                                    </button>
                                }

                            </div>
                            <div className="mt-3" key={activities.length}>
                                {activities.map((activity, index) => (
                                    <div key={index} className="flex space-x-2 mt-3">
                                        <div className="bg-[#579dff] text-[#2d4361] w-[32px] h-[32px] rounded-full">
                                            <h3 className="font-semibold text-center pt-1">{initials}</h3>
                                        </div>
                                        <div>
                                            <p className="text-sm"><span className="font-bold">{user ? `${user.displayName}` : "No user"}</span></p>
                                            {editIndex === index ? (
                                                <div className="flex flex-col">
                                                    <JoditEditor
                                                        value={editedComment}
                                                        config={activityEditorConfig}
                                                        onBlur={(newContent) => setEditedComment(newContent)}
                                                        onChange={() => { }}
                                                    />
                                                    <div className="flex mt-2 space-x-2">
                                                        <button onClick={() => handleSaveEditedComment(index)}
                                                            className="bg-[#579dff] hover:bg-blue-400 font-bold rounded-sm h-[32px] cursor-pointer w-[50px] text-sm text-[#2d4361]">
                                                            Save
                                                        </button>
                                                        <button onClick={() => setEditIndex(null)}
                                                            className="text-[#b6c2cf] h-[32px] w-[50px] rounded-sm text-sm">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div
                                                        className="w-full min-w-[495px] text-left font-extralight text-sm pb-2 pl-3 pt-2 mt-1.5 bg-[#22272b] text-[#b9c5cf] rounded-lg hover:bg-gray-600"
                                                        dangerouslySetInnerHTML={{ __html: activity }}
                                                    />
                                                    <div className="flex space-x-2 mt-1.5 ml-1.5">
                                                        <button onClick={() => startEditing(index, activity)}
                                                            className="text-[#9aa5ad] hover:underline text-xs ">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteActivity(index)} className="text-[#9aa5ad] hover:underline text-xs">Delete</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {showDetails && (
                            <div className="flex space-x-2 mt-3">
                                <div className="bg-[#579dff] text-[#2d4361] w-[32px] h-[32px] rounded-full">
                                    <h3 className="font-semibold text-center pt-1">{initials}</h3>
                                </div>
                                <div>
                                    <p className="text-sm"><span className="font-bold">{user ? `${user.displayName}` : "No user"}</span> added this card to {TaskStatus.charAt(0).toUpperCase() + TaskStatus.slice(1)}</p>
                                    <p className="text-xs text-[#a3aab1]">{formattedDate}, {formattedTime}</p>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="max-w-[195px] w-full p-5 md:max-w-[195px] md:w-full">
                        <div>
                            <h3 className="text-xs">Add to card</h3>
                            <button className="flex items-center font-semibold w-full text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c-3.315 0-9 1.675-9 5.25V21h18v-1.5c0-3.575-5.685-5.25-9-5.25z" />
                                    </svg>
                                </span>
                                Members
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75l8.25 8.25 7.5-7.5-8.25-8.25-7.5 7.5v8.25h8.25l7.5-7.5" />
                                    </svg>
                                </span>
                                Labels
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75h15m-15-4.5h15M4.5 18h15M9 8.25L4.5 12.75M4.5 18l4.5-4.5" />
                                    </svg>
                                </span>
                                Checklist
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </span>
                                Dates
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                    </svg>

                                </span>
                                Attachment
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6.75L12 14.25 4.5 6.75" />
                                    </svg>
                                </span>
                                Cover
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h13.5m-13.5 6h13.5m-13.5-12h13.5" />
                                    </svg>
                                </span>
                                Custom Fields
                            </button>
                        </div>
                        <div className="pt-4">
                            <h3 className="text-xs">Power-Ups</h3>
                            <button className="flex items-center font-semibold w-full text-left text-sm mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </span>
                                Add Power-Ups
                            </button>
                        </div>
                        <div className="pt-4">
                            <h3 className="text-xs">Automation</h3>
                            <button className="flex items-center w-full font-semibold text-left text-sm mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </span>
                                Add button
                            </button>
                        </div>
                        <div className="pt-4">
                            <div className="flex justify-between">
                                <h3 className="text-xs">Actions</h3>
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>

                                </span>
                            </div>
                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                                Move
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                                    </svg>

                                </span>
                                Copy
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                    </svg>

                                </span>
                                Make template
                            </button>

                            <div className="border-b border-gray-600 pt-2">

                            </div>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                    </svg>
                                </span>
                                Archive
                            </button>

                            <button className="flex items-center w-full font-semibold text-left text-sm bg-[#3c454d] mt-2 p-1.5 rounded-[3px] cursor-pointer hover:bg-gray-600">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                    </svg>
                                </span>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default TaskModal;   