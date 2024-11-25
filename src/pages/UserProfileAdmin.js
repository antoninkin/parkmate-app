import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './UserProfileAdmin.css';

const UserProfileAdmin = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [userCars, setUserCars] = useState([]);
    const [userReservations, setUserReservations] = useState([]);
    const [userPayments, setUserPayments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setUserData({ id: userDoc.id, ...userDoc.data() });
            } else {
                alert('User not found');
                navigate('/admin/search-user');
            }

            // Fetch user's cars
            const carsQuery = query(collection(db, 'cars'), where('userId', '==', userId));
            const carsSnapshot = await getDocs(carsQuery);
            setUserCars(carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch user's reservations
            const reservationsQuery = query(collection(db, 'reservations'), where('userId', '==', userId));
            const reservationsSnapshot = await getDocs(reservationsQuery);
            setUserReservations(reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch user's payments
            const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', userId));
            const paymentsSnapshot = await getDocs(paymentsQuery);
            setUserPayments(paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchUserData();
    }, [userId, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSave = async () => {
        await updateDoc(doc(db, 'users', userId), userData);
        setIsEditing(false);
        alert('User profile updated successfully');
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteDoc(doc(db, 'users', userId));
            alert('User deleted successfully');
            navigate('/admin/search-user');
        }
    };

    if (!userData) return <div>Loading...</div>;

    return (
        <div className="user-profile-admin">
            <h1>User Profile (Admin View)</h1>
            <div className="user-details">
                {isEditing ? (
                    <>
                        <input name="firstName" value={userData.firstName} onChange={handleInputChange} />
                        <input name="lastName" value={userData.lastName} onChange={handleInputChange} />
                        <input name="email" value={userData.email} onChange={handleInputChange} />
                        <input name="phone" value={userData.phone} onChange={handleInputChange} />
                        <button onClick={handleSave}>Save Changes</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                ) : (
                    <>
                        <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Phone:</strong> {userData.phone}</p>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button onClick={handleDelete}>Delete User</button>
                    </>
                )}
            </div>
            <div className="user-cars">
                <h2>User's Cars</h2>
                {userCars.map(car => (
                    <div key={car.id} className="car-item">
                        <p>Make: {car.make}</p>
                        <p>Model: {car.model}</p>
                        <p>License Plate: {car.licensePlate}</p>
                    </div>
                ))}
            </div>
            <div className="user-reservations">
                <h2>User's Reservations</h2>
                {userReservations.map(reservation => (
                    <div key={reservation.id} className="reservation-item">
                        <p>Location: {reservation.carParkName}</p>
                        <p>Date: {reservation.arrivalDate} to {reservation.exitDate}</p>
                        <p>Status: {reservation.status}</p>
                    </div>
                ))}
            </div>
            <div className="user-payments">
                <h2>User's Payments</h2>
                {userPayments.map(payment => (
                    <div key={payment.id} className="payment-item">
                        <p>Amount: ${payment.amount}</p>
                        <p>Date: {payment.timestamp.toDate().toLocaleString()}</p>
                        <p>Status: {payment.status}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => navigate('/admin/search-user')} className="back-button">Back to Search</button>
        </div>
    );
};

export default UserProfileAdmin;