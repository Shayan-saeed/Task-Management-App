import React from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './authService';
import { toast, Bounce } from "react-toastify";
import { useFormik } from 'formik';
import { loginSchema } from '../schemas';

const Login: React.FC = () => {

  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: ""
  }

  const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: (values, actions) => {
      try {
        login(values.email, values.password);
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
      actions.resetForm()
    }
  })

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-800 bg-opacity-20 p-8 mt-20 rounded-lg shadow-lg w-full max-w-md">
        <div className='flex flex-row justify-center items-center mb-6 mt-2 gap-3'>
        <img src="https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Trello-512.png" alt="trello-logo" className='w-[30px] h-[30px]' />
        <h1 className='text-4xl font-bold text-white'>Trello</h1>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-6">Login to your account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-1">Email</label>
            <input
              id="email"
              name='email'
              type="email"
              autoComplete='off'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.email && touched.email ? <p className='text-red-500'>{errors.email}</p> : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-1">Password</label>
            <input
              id="password"
              name='password'
              type="password"
              autoComplete='off'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.password && touched.password ? <p className='text-red-500'>{errors.password}</p> : null}
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </button>
          <p className="text-center text-white mt-4">
            New user? <a href="/signup" className="text-blue-700 hover:underline">Register Here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
