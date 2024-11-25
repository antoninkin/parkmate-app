import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import './History.css';

const ReservationHistory = () => {
    const { currentUser } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            if (currentUser) {
                const reservationsRef = collection(db, 'reservations');
                const q = query(
                    reservationsRef,
                    where('userId', '==', currentUser.uid),
                    orderBy('arrivalDate', 'desc')
                );
                const querySnapshot = await getDocs(q);
                setReservations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        };
        fetchReservations();
    }, [currentUser]);

    const cancelBooking = async (reservationId, paymentId) => {
        try {
            // Update reservation status
            const reservationRef = doc(db, 'reservations', reservationId);
            await updateDoc(reservationRef, { status: 'Cancelled' });

            // Update payment status
            if (paymentId) {
                const paymentRef = doc(db, 'payments', paymentId);
                await updateDoc(paymentRef, { status: 'Returned' });
            }

            // Update local state
            setReservations(reservations.map(reservation =>
                reservation.id === reservationId
                    ? { ...reservation, status: 'Cancelled' }
                    : reservation
            ));

            alert('Booking cancelled successfully');
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    const canCancelBooking = (arrivalDate, arrivalTime) => {
        const now = new Date();
        const bookingStart = new Date(`${arrivalDate}T${arrivalTime}`);
        return bookingStart > now;
    };

    return (
        <div className="history-container">
            <h2>Reservation History</h2>
            {reservations.map((reservation) => (
                <div key={reservation.id} className="history-item">
                    <p>Car Park: {reservation.carParkName}</p>
                    <p>Arrival: {reservation.arrivalDate} {reservation.arrivalTime}</p>
                    <p>Exit: {reservation.exitDate} {reservation.exitTime}</p>
                    <p>Price: ${reservation.price}</p>
                    <p>Status: {reservation.status}</p>
                    {canCancelBooking(reservation.arrivalDate, reservation.arrivalTime) && reservation.status !== 'Cancelled' && (
                        <button onClick={() => cancelBooking(reservation.id, reservation.paymentId)} className="cancel-button">
                            Cancel Booking
                        </button>
                    )}
                </div>
            ))}
            <Link to="/profile" className="back-button">Back to Profile</Link>
        </div>
    );
};

export default ReservationHistory;