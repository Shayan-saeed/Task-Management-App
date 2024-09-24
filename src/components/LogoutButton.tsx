// src/components/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from './authService';
import { toast } from "react-toastify";
import LogoutIcon from '../icons/LogoutIcon';

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
    <button onClick={handleLogout} className="flex gap-2 items-center
    text-[#172b4d] bg-[#dadde3] hover:bg-white focus:outline-none rounded text-sm px-3 py-1.5 text-center me-2 mb-2">
      <LogoutIcon />
      Logout
    </button>
  );
};

export default LogoutButton;
