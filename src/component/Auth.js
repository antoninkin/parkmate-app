import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';
import '../pages/Login';

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/profile');
        }
    }, [currentUser, navigate]);

    const handleGoogleSignIn = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const userData = await signInWithGoogle();
            if (userData && userData.email) {
                setCurrentUser(userData);
                navigate('/profile');
            } else {
                throw new Error('Failed to get user email after Google Sign-In');
            }
        } catch (error) {
            console.error("Google sign-in error", error);
            setErrors({ auth: "An error occurred during Google Sign-In. Please try again or use another sign-in method." });
        }
    };

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setCurrentUser(userCredential.user);
            navigate('/profile');
        } catch (error) {
            console.error("Email sign-in error", error);
            setErrors({ auth: error.message });
        }
    };

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setCurrentUser(userCredential.user);
            navigate('/profile');
        } catch (error) {
            console.error("Email sign-up error", error);
            setErrors({ auth: error.message });
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrors({ email: 'Please enter your email address' });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent. Please check your inbox.');
            setShowForgotPassword(false);
        } catch (error) {
            console.error("Password reset error", error);
            setErrors({ auth: error.message });
        }
    };

    if (currentUser) {
        return <div>Redirecting to profile...</div>;
    }

    return (
        <div className="auth-container">
            {!showForgotPassword ? (
                <form className="auth-form" onSubmit={handleEmailSignIn}>
                    <div className="auth-buttons">
                        <button type="submit" className="auth-button">Sign In</button>
                        <button type="button" onClick={handleEmailSignUp} className="auth-button">Sign Up</button>
                        <button onClick={handleGoogleSignIn} className="auth-button google-button"></button>
                        {errors.auth && <div className="auth-error">{errors.auth}</div>}
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                    />
                    {errors.email && <div className="error">{errors.email}</div>}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                    />
                    {errors.password && <div className="error">{errors.password}</div>}
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="forgot-password-button">Forgot Password?</button>
                </form>
            ) : (
                <div className="forgot-password-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                    />
                    <button onClick={handleForgotPassword} className="auth-button">Reset Password</button>
                    <button onClick={() => setShowForgotPassword(false)} className="auth-button">Back to Login</button>
                </div>
            )}
        </div>
    );
};