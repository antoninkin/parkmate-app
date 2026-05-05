import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import './History.css';

const ReservationHistory = () => {
    const { currentUser } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            if (!currentUser) return;
            try {
                const reservationsRef = collection(db, 'reservations');
                const q = query(
                    reservationsRef,
                    where('userId', '==', currentUser.uid),
                    orderBy('arrivalDate', 'desc')
                );
                const querySnapshot = await getDocs(q);
                setReservations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching reservations:", err);
                setError("Failed to load reservation history. Please try again.");
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

    const canCancelBooking = (reservation) => {
        const time = reservation.arrivalTime ?? `${reservation.arrivalHour}:${reservation.arrivalMinute}`;
        const bookingStart = new Date(`${reservation.arrivalDate}T${time}`);
        return bookingStart > new Date();
    };

    return (
        <div className="history-container">
            <h2>Reservation History</h2>
            {error && <p className="error-message">{error}</p>}
            {reservations.map((reservation) => (
                <div key={reservation.id} className="history-item">
                    <p>Car Park: {reservation.carParkName}</p>
                    <p>Arrival: {reservation.arrivalDate} {reservation.arrivalTime ?? `${reservation.arrivalHour}:${reservation.arrivalMinute}`}</p>
                    <p>Exit: {reservation.exitDate} {reservation.exitTime ?? `${reservation.exitHour}:${reservation.exitMinute}`}</p>
                    <p>Price: ${reservation.price}</p>
                    <p>Status: {reservation.status}</p>
                    {canCancelBooking(reservation) && reservation.status !== 'Cancelled' && (
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