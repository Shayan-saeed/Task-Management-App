import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from './authService';
import { toast } from "react-toastify";
import { useFormik } from 'formik';
import { signUpSchema } from '../schemas';



const Signup: React.FC = () => {
  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirm_password: ""
  }

  const navigate = useNavigate();

  const {values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: signUpSchema,
    onSubmit: (values, action) => {
      try {
        signUp(values.email, values.password, values.name);
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
       action.resetForm()
    } 
  })

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-800 bg-opacity-20 p-8 mt-14 rounded-lg shadow-lg w-full max-w-md">
      <div className='flex flex-row justify-center items-center mb-6 mt-2 gap-3'>
        <img src="https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Trello-512.png" alt="trello-logo" className='w-[30px] h-[30px]' />
        <h1 className='text-4xl font-bold text-white'>Trello</h1>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-6">Register an account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-white font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              autoComplete='off'
              name='name'
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.name && touched.name ? <p className='text-red-500'>{errors.name}</p> : null}
          </div>
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              name='email'
              autoComplete='off'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.email && touched.email ?<p className='text-red-500'>{errors.email}</p> : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              name='password'
              autoComplete='off'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.password && touched.password ?<p className='text-red-500'>{errors.password}</p> : null}
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-white font-medium mb-1">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              name='confirm_password'
              autoComplete='off'
              value={values.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your confirm password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {errors.confirm_password && touched.confirm_password ? <p className='text-red-500'>{errors.confirm_password}</p> : null}
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
