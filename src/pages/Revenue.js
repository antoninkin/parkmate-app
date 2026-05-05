import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Revenue.css';

const Revenue = () => {
    const navigate = useNavigate();
    const [revenue, setRevenue] = useState(0);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState('');
    const [parkingLocation, setParkingLocation] = useState('');
    const [parkingLocations, setParkingLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        if (isLoading) return;
        setIsLoading(true);

        try {
            const paymentsCollection = collection(db, 'payments');
            let q = query(paymentsCollection);

            if (month) {
                const monthNum = parseInt(month, 10);
                if (monthNum < 1 || monthNum > 12) return;
                const monthStartDate = new Date(`${year}-${month}-01T00:00:00`);
                const monthEndDate = new Date(new Date(monthStartDate).setMonth(monthStartDate.getMonth() + 1));
                q = query(q, where('timestamp', '>=', monthStartDate), where('timestamp', '<', monthEndDate));
            } else {
                const startDate = new Date(`${year}-01-01T00:00:00`);
                const endDate = new Date(`${parseInt(year, 10) + 1}-01-01T00:00:00`);
                q = query(q, where('timestamp', '>=', startDate), where('timestamp', '<', endDate));
            }

            const querySnapshot = await getDocs(q);
            let totalRevenue = 0;

            for (const docSnapshot of querySnapshot.docs) {
                const payment = docSnapshot.data();
                if (!payment.reservationId) continue;

                if (parkingLocation) {
                    // Use locationId stored on payment (new payments) to avoid N+1 fetch
                    if (payment.locationId) {
                        if (payment.locationId === parkingLocation) {
                            totalRevenue += payment.amount ?? 0;
                        }
                        continue;
                    }
                    // Fall back to reservation fetch for older payments without locationId
                    const reservationDoc = await getDoc(doc(db, 'reservations', payment.reservationId));
                    if (reservationDoc.exists() && reservationDoc.data().locationId === parkingLocation) {
                        totalRevenue += payment.amount ?? 0;
                    }
                } else {
                    totalRevenue += payment.amount ?? 0;
                }
            }

            setRevenue(totalRevenue);
        } catch (err) {
            console.error("Error calculating revenue:", err);
        } finally {
            setIsLoading(false);
        }
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
                <button onClick={calculateRevenue} disabled={isLoading}>
                    {isLoading ? 'Calculating...' : 'Calculate Revenue'}
                </button>
            </div>
            <div className="revenue-display">
                <h2>Total Revenue: ${revenue.toFixed(2)}</h2>
            </div>
            <button onClick={() => navigate('/admin')} className="back-button">Back to Admin Page</button>
        </div>
    );
};

export default Revenue;