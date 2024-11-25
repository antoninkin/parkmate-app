import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, addDoc, collection, getDoc } from 'firebase/firestore';
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

    useEffect(() => {
        console.log("Payment component mounted. Location state:", location.state);
        if (location.state && location.state.reservationId) {
            setReservationData(location.state);
        } else {
            setError("No reservation data provided. Please go back and try booking again.");
        }
    }, [location.state]);

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (!reservationData) {
            alert('No reservation data available');
            return;
        }

        try {
            // Update reservation status
            const reservationRef = doc(db, 'reservations', reservationData.reservationId);
            await updateDoc(reservationRef, {
                status: 'paid',
                paymentMethod: paymentMethod
            });

            // Add payment details to a new 'payments' collection
            const paymentData = {
                reservationId: reservationData.reservationId,
                userId: currentUser.uid,
                amount: reservationData.price,
                paymentMethod: paymentMethod,
                timestamp: new Date(),
                status: 'completed'
            };

            await addDoc(collection(db, 'payments'), paymentData);

            // Update available spots in parkingLocations
            const parkingLocationRef = doc(db, 'parkingLocations', reservationData.locationId);
            const parkingLocationDoc = await getDoc(parkingLocationRef);
            if (parkingLocationDoc.exists()) {
                const currentSpots = parkingLocationDoc.data().availableSpots;
                await updateDoc(parkingLocationRef, {
                    availableSpots: currentSpots - 1
                });
            }

            alert('Payment successful!');
            navigate('/'); // Navigate back to home or to a confirmation page
        } catch (error) {
            console.error("Error processing payment: ", error);
            alert('Payment failed. Please try again.');
        }
    };

    if (error) {
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
            <div className="payment-methods">
                <h2>Select Payment Method</h2>
                <div>
                    <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={handlePaymentMethodChange}
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
                        onChange={handlePaymentMethodChange}
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
                        onChange={handlePaymentMethodChange}
                    />
                    <label htmlFor="google-pay">Google Pay</label>
                </div>
            </div>
            <button onClick={handlePayment} className="pay-button">Pay Now</button>
        </div>
    );
};

export default Payment;