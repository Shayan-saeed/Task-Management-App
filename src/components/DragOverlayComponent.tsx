import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './types';

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
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {task.content}
        </div>
    );
};

export default DragOverlayComponent;
