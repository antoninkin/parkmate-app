import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, addDoc, collection, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../contexts/AuthContext';
import './Payment.css';

const Payment = () => {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [reservationData, setReservationData] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const reservationId = location.state?.reservationId;
        if (!reservationId) {
            setError("No reservation data provided. Please go back and try booking again.");
            return;
        }
        if (!currentUser) return;

        const fetchReservation = async () => {
            try {
                const reservationRef = doc(db, 'reservations', reservationId);
                const reservationDoc = await getDoc(reservationRef);

                if (!reservationDoc.exists()) {
                    setError("Reservation not found.");
                    return;
                }

                const data = reservationDoc.data();

                if (data.userId !== currentUser.uid) {
                    setError("You don't have permission to pay for this reservation.");
                    return;
                }

                if (data.status !== 'pending') {
                    setError("This reservation has already been paid or is no longer valid.");
                    return;
                }

                const arrivalTime = data.arrivalHour && data.arrivalMinute
                    ? `${data.arrivalHour}:${data.arrivalMinute}`
                    : '';
                const exitTime = data.exitHour && data.exitMinute
                    ? `${data.exitHour}:${data.exitMinute}`
                    : '';

                setReservationData({ reservationId, ...data, arrivalTime, exitTime });
            } catch (err) {
                console.error("Error fetching reservation:", err);
                setError("Failed to load reservation. Please try again.");
            }
        };

        fetchReservation();
    }, [location.state, currentUser]);

    const handlePayment = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method.');
            return;
        }
        if (!reservationData || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const reservationRef = doc(db, 'reservations', reservationData.reservationId);
            const parkingLocationRef = doc(db, 'parkingLocations', reservationData.locationId);
            const paymentRef = doc(collection(db, 'payments'));

            await runTransaction(db, async (transaction) => {
                const reservationDoc = await transaction.get(reservationRef);
                const parkingDoc = await transaction.get(parkingLocationRef);

                if (!reservationDoc.exists()) throw new Error("Reservation no longer exists.");
                const res = reservationDoc.data();
                if (res.status !== 'pending') throw new Error("This reservation has already been paid.");
                if (res.userId !== currentUser.uid) throw new Error("Unauthorized.");

                if (parkingDoc.exists()) {
                    const spots = parkingDoc.data().availableSpots;
                    if (spots <= 0) throw new Error("No available spots at this location.");
                    transaction.update(parkingLocationRef, { availableSpots: spots - 1 });
                }

                transaction.update(reservationRef, {
                    status: 'paid',
                    paymentMethod,
                });

                transaction.set(paymentRef, {
                    reservationId: reservationData.reservationId,
                    userId: currentUser.uid,
                    locationId: reservationData.locationId,
                    amount: reservationData.price,
                    paymentMethod,
                    timestamp: new Date(),
                    status: 'completed',
                });
            });

            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error processing payment:", err);
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error && !reservationData) {
        return <div className="error-message">{error}</div>;
    }

    if (!reservationData) {
        return <div>Loading reservation data...</div>;
    }

    return (
        <div className="payment-container">
            <h1>Payment</h1>
            <div className="reservation-details">
                <h2>Reservation Details</h2>
                <p>Car Park: {reservationData.carParkName}</p>
                <p>Arrival: {reservationData.arrivalDate} {reservationData.arrivalTime}</p>
                <p>Exit: {reservationData.exitDate} {reservationData.exitTime}</p>
                <p>Total Price: ${reservationData.price}</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="payment-methods">
                <h2>Select Payment Method</h2>
                <div>
                    <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="card">Credit Card</label>
                </div>
                <div>
                    <input
                        type="radio"
                        id="apple-pay"
                        name="paymentMethod"
                        value="apple-pay"
                        checked={paymentMethod === 'apple-pay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="apple-pay">Apple Pay</label>
                </div>
                <div>
                    <input
                        type="radio"
                        id="google-pay"
                        name="paymentMethod"
                        value="google-pay"
                        checked={paymentMethod === 'google-pay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="google-pay">Google Pay</label>
                </div>
            </div>
            <button
                onClick={handlePayment}
                className="pay-button"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
};

export default Payment;
