// src/components/Signup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from './authService';
import { toast } from "react-toastify";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

     
    try {
      await signUp(email, password);
      navigate('/board');
      toast.success("User Registered Successfully!!", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Signup failed", error);
      toast.error("Error while registering the user", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-800 bg-opacity-20 p-8 mt-20 rounded-lg shadow-lg w-full max-w-md">
        <h1 className='text-4xl font-bold text-center text-white mb-6'>Trello</h1>
        <h1 className="text-2xl font-bold text-center text-white mb-6">Register an account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-1">Email</label>
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
            <label htmlFor="password" className="block text-white font-medium mb-1">Password</label>
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
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-1">Confirm Password</label>
            <input
              id="password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your confirm password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
          >Sign Up</button>
        </form>
        <p className="text-white mt-4 text-center">
          Already have an account? <a href="/login" className="text-blue-700 hover:underline">Log In Here</a>
        </p>
      </div>
    </div>

  );
};

export default Signup;
