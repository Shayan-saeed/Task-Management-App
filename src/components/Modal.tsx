import React from "react";

interface ModalProps {
    closeModal: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ closeModal, children }) => {

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <div onClick={closeModal} className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div onClick={handleContentClick} className="bg-gray-200 p-7 pr-9 rounded-xl relative mx-auto my-auto shadow-lg">
                {children}
            </div>
        </div>
    );
};

export default Modal;
