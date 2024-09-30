import React, { useEffect } from "react";

interface ModalProps {
  closeModal: () => void;
  rect: DOMRect;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ closeModal, rect, children }) => {
  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const input = document.querySelector("input");
    input?.focus();
  }, []);

  return (
    <div onClick={closeModal} className="fixed inset-0 z-50">
      <div
        onClick={handleContentClick}
        className="bg-[#101204] min-w-[270px] pr-2 pl-2 pt-2 rounded-xl relative shadow-lg"
        style={{ 
          position: 'absolute', 
          top: `${rect.top + window.scrollY}px`,
          left: `${rect.left}px`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
