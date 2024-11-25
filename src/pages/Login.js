// src/pages/
import React from 'react';
import { Auth } from '../component/Auth';
import './Login.css';

const Login = () => {
    return (
        <div className="login-page">
            <h1>Login to ParkMate</h1>
            <Auth />
        </div>
    );
};

export default Login;