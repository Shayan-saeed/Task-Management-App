import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './types';
import { border } from '@mui/system';

interface DragOverlayProps {
    task: Task;
}

const DragOverlayComponent: React.FC<DragOverlayProps> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: 'transform 250ms ease',
        margin: '0.5rem',
        backgroundColor: '#172b4d',
        minHeight: '20px',
        color: '#9fadbc',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {task.content || "undefined"}
        </div>
    );
};

export default DragOverlayComponent;
