import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Revenue.css';

const Revenue = () => {
    const navigate = useNavigate();
    const [revenue, setRevenue] = useState(0);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState('');
    const [parkingLocation, setParkingLocation] = useState('');
    const [parkingLocations, setParkingLocations] = useState([]);

    useEffect(() => {
        const fetchParkingLocations = async () => {
            const locationsCollection = collection(db, 'parkingLocations');
            const locationsSnapshot = await getDocs(locationsCollection);
            const locationsData = locationsSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            setParkingLocations(locationsData);
        };

        fetchParkingLocations();
    }, []);

    const calculateRevenue = async () => {
        const paymentsCollection = collection(db, 'payments');
        let q = query(paymentsCollection, orderBy('timestamp', 'desc'));

        const startDate = new Date(`${year}-01-01T00:00:00`);
        const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00`);
        q = query(q, where('timestamp', '>=', startDate), where('timestamp', '<', endDate));

        if (month) {
            const monthStartDate = new Date(`${year}-${month}-01T00:00:00`);
            const monthEndDate = new Date(new Date(monthStartDate).setMonth(monthStartDate.getMonth() + 1));
            q = query(q, where('timestamp', '>=', monthStartDate), where('timestamp', '<', monthEndDate));
        }

        const querySnapshot = await getDocs(q);
        let totalRevenue = 0;

        console.log(`Total documents retrieved: ${querySnapshot.size}`);
        console.log(`Selected parking location: ${parkingLocation}`);

        for (const docSnapshot of querySnapshot.docs) {
            const payment = docSnapshot.data();
            console.log(`Payment:`, payment);

            if (!payment.reservationId) {
                console.log(`Skipped: payment has no reservationId`);
                continue;
            }

            // Fetch the reservation to get the locationId
            const reservationRef = doc(db, 'reservations', payment.reservationId);
            const reservationDoc = await getDoc(reservationRef);

            if (reservationDoc.exists()) {
                const reservation = reservationDoc.data();
                console.log(`Reservation:`, reservation);
                if (!parkingLocation || reservation.locationId === parkingLocation) {
                    totalRevenue += payment.amount;
                    console.log(`Added to total: ${payment.amount}`);
                } else {
                    console.log(`Skipped: reservation locationId doesn't match`);
                }
            } else {
                console.log(`Skipped: reservation not found`);
            }
        }

        console.log(`Final total revenue: ${totalRevenue}`);
        setRevenue(totalRevenue);
    };

    return (
        <div className="revenue-page">
            <h1>Revenue Dashboard</h1>
            <div className="filters">
                <input
                    type="number"
                    placeholder="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    min="2000"
                    max="2100"
                    className="year-input"
                />
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m.toString().padStart(2, '0')}>
                            {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select value={parkingLocation} onChange={(e) => setParkingLocation(e.target.value)}>
                    <option value="">All Locations</option>
                    {parkingLocations.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                </select>
                <button onClick={calculateRevenue}>Calculate Revenue</button>
            </div>
            <div className="revenue-display">
                <h2>Total Revenue: ${revenue.toFixed(2)}</h2>
            </div>
            <button onClick={() => navigate('/admin')} className="back-button">Back to Admin Page</button>
        </div>
    );
};

export default Revenue;