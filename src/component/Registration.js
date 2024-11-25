import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        carModel: '',
        licensePlate: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                carModel: formData.carModel,
                licensePlate: formData.licensePlate
            });

            window.alert('Registration successful!');
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="registration-container">
            <h1>Create a ParkMate Account</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input type="text" id="firstName" name="firstName" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input type="email" id="email" name="email" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input type="password" id="password" name="password" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="carModel">Car Model</label>
                    <input type="text" id="carModel" name="carModel" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="licensePlate">License Plate</label>
                    <input type="text" id="licensePlate" name="licensePlate" onChange={handleChange} />
                </div>
                <button type="submit" className="register-button">Register</button>
            </form>
            {error && <div className="error">{error}</div>}
            <div className="login-link">
                <p>Already have an account? <Link to="/login">Login</Link> instead.</p>
            </div>
        </div>
    );
};

export default Registration;