// src/components/Login.tsx
import React, { ReactEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './authService';
import { toast, Bounce } from "react-toastify";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/board');
      toast.success("User logged in Successfully", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please check your credentials.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-800 bg-opacity-20 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Login to your account</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </button>
          <p className="text-center text-gray-700 mt-4">
            New user? <a href="/signup" className="text-blue-700 hover:underline">Register Here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
