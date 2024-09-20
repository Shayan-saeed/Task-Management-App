// src/components/StatusDragOverlayComponent.tsx
import React, { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface StatusDragOverlayProps {
    status: string;
}

const StatusDragOverlayComponent: React.FC<StatusDragOverlayProps> = ({ status }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: status,
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
            {status}
        </div>
    );
};

export default StatusDragOverlayComponent;
