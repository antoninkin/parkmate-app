import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './History.css';

const PaymentHistory = () => {
    const { currentUser } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            if (currentUser) {
                const paymentsRef = collection(db, 'payments');
                const q = query(
                    paymentsRef,
                    where('userId', '==', currentUser.uid),
                    orderBy('timestamp', 'desc')
                );
                const querySnapshot = await getDocs(q);
                setPayments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        };
        fetchPayments();
    }, [currentUser]);

    return (
        <div className="history-container">
            <h2>Payment History</h2>
            {payments.map((payment) => (
                <div key={payment.id} className="history-item">
                    <p>Amount: ${payment.amount}</p>
                    <p>Date: {payment.timestamp.toDate().toLocaleString()}</p>
                    <p>Payment Method: {payment.paymentMethod}</p>
                    <p>Status: {payment.status}</p>
                </div>
            ))}
            <Link to="/profile" className="back-button">Back to Profile</Link>
        </div>
    );
};

export default PaymentHistory;