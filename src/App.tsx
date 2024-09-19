import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./components/firebaseConfig";
import Board from "./components/Board";
import Signup from "./components/Signup";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";
import AppIcon from "./icons/AppIcon";
import { ToastContainer } from "react-toastify";


const App: React.FC = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isBoardPage = location.pathname === "/board";
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/board');
        }
      } else {
        setCurrentUser(null);
        if (location.pathname === '/board') {
          navigate('/login')
        }
      }
    });

    return () => unsubscribe();
  }, [location, navigate])
  return (
    <div className="App
      m-auto
      p-4
      bg-gradient-to-r from-pink-600 via-purple-500 to-blue-400 min-h-screen font-sans 
    ">
      {/* #FF2CDDF #0014FF */}
      <header className="flex justify-between items-center">
        <div className="flex items-center justify-center py-4 space-x-4 flex-grow">
          <AppIcon />
          <h1 className="text-4xl font-bold font-sans text-gray-700">Trello</h1>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isBoardPage && currentUser ? <LogoutButton /> : null}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/board" element={currentUser ? <Board /> : null} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <ToastContainer />
      </main>
    </div>
  );
};

export default App;
