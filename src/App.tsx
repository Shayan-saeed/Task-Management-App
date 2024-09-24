import React, { useState, useEffect } from "react";
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
  const loginSignup = location.pathname === '/login' || location.pathname === '/signup' 
  const board = location.pathname === '/board'
  const navigate = useNavigate();

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
  }, [location, navigate])
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
