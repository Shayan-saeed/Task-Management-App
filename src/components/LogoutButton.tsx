// src/components/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from './authService';
import { toast } from "react-toastify";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login'); 
      toast.success('User Logged out Successfully', {
        position: "top-right"
      })
    } catch (error) {
      console.error("Logout failed", error);
      toast.error('Logout Failed', {
        position: "top-right"
      })
    }
  };

  return (
    <button onClick={handleLogout} className="p-2  bg-gray-200 bg-opacity-30 px-4 text-white rounded-lg">
      Logout
    </button>
  );
};

export default LogoutButton;
