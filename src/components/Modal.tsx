import React from "react";

interface ModalProps {
    closeModal: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ closeModal, children }) => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg">
                {children}
                <button onClick={closeModal} className="mt-4 p-2 bg-red-500 text-white rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
