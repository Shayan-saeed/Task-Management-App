import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./components/firebaseConfig";
import Board from "./components/Board";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";


const App: React.FC = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const loginSignup = useMemo(() => location.pathname === '/login' || location.pathname === '/signup', [location.pathname]);
  const board = useMemo(() => location.pathname === '/board', [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (loginSignup) {
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
  }, [loginSignup, location.pathname, navigate])
  
  return (
    <div className="App
      m-auto
      
      bg-[#8f3f65] min-h-screen font-sans 
    ">
      {board && <Navbar currentUser={currentUser} />}
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
