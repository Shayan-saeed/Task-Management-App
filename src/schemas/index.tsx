import * as Yup from 'yup';

export const signUpSchema = Yup.object({
    name: Yup.string().min(2).max(25).required("Please enter your name"),
    email: Yup.string().required("Please enter your email").matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"Enter a valid email"),
    password: Yup.string().min(6).required("Please enter your password"),
    confirm_password: Yup.string()
        .required()
        .oneOf([Yup.ref("password")], "Password must match"),
})

export const loginSchema = Yup.object({
    email: Yup.string().required("Please enter your email").matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"Enter a valid email"),
    password: Yup.string().required("Please enter your password")
})