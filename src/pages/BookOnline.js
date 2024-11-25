import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../contexts/AuthContext';
import './BookOnline.css';

const BookOnline = () => {
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState({
        carParkName: '',
        locationId: '',
        arrivalDate: '',
        arrivalHour: '',
        arrivalMinute: '',
        exitDate: '',
        exitHour: '',
        exitMinute: '',
        carId: ''
    });
    const [parkingLocations, setParkingLocations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [userCars, setUserCars] = useState([]);

    const fetchUserCars = useCallback(async () => {
        if (currentUser) {
            const carsCollectionRef = collection(db, 'cars');
            const carsQuery = query(carsCollectionRef, where('userId', '==', currentUser.uid));
            const carsSnapshot = await getDocs(carsQuery);
            setUserCars(carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    }, [currentUser]);

    useEffect(() => {
        if (location.state && location.state.name) {
            setBookingData(prev => ({
                ...prev,
                carParkName: location.state.name,
                locationId: location.state.id
            }));
        }
        fetchParkingLocations();
        fetchUserCars();
    }, [location.state, fetchUserCars]);

    const fetchParkingLocations = async () => {
        const parkingLocationsCollection = collection(db, 'parkingLocations');
        const parkingLocationsSnapshot = await getDocs(parkingLocationsCollection);
        const locations = parkingLocationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setParkingLocations(locations);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
        if (name === 'carParkName') {
            const filteredSuggestions = parkingLocations.filter(location =>
                location.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setBookingData(prev => ({
            ...prev,
            carParkName: suggestion.name,
            locationId: suggestion.id
        }));
        setSuggestions([]);
    };

    const calculatePrice = () => {
        const arrival = new Date(`${bookingData.arrivalDate}T${bookingData.arrivalHour}:${bookingData.arrivalMinute}`);
        const exit = new Date(`${bookingData.exitDate}T${bookingData.exitHour}:${bookingData.exitMinute}`);
        const duration = (exit - arrival) / 3600000; // duration in hours

        let price = 0;
        let remainingHours = duration;

        const isDayTime = (hour) => hour >= 7 && hour < 21;
        const isNightTime = (hour) => hour < 7 || hour >= 21;

        while (remainingHours > 0) {
            const currentHour = (arrival.getHours() + (duration - remainingHours)) % 24;

            if (isDayTime(currentHour)) {
                if (remainingHours <= 1) {
                    price += 10; // Minimum 1 hour charge
                    remainingHours = 0;
                } else if (remainingHours <= 2) {
                    price += 10 * Math.ceil(remainingHours);
                    remainingHours = 0;
                } else {
                    price += 20; // First 2 hours
                    const additionalHours = Math.floor(remainingHours - 2);
                    price += 7 * additionalHours;
                    const fractionalHour = remainingHours - 2 - additionalHours;
                    price += 7 * Math.ceil(fractionalHour * 4) / 4; // Round up to nearest quarter hour
                    remainingHours = 0;
                }
            } else if (isNightTime(currentHour)) {
                const nightHours = Math.min(remainingHours, currentHour < 7 ? 7 - currentHour : 31 - currentHour);
                if (nightHours <= 1) {
                    price += 12; // Minimum 1 hour charge (night rate)
                } else if (nightHours <= 2) {
                    price += 12 * Math.ceil(nightHours);
                } else {
                    price += 24; // First 2 hours (night rate)
                    const additionalHours = Math.floor(nightHours - 2);
                    price += 8.4 * additionalHours;
                    const fractionalHour = nightHours - 2 - additionalHours;
                    price += 8.4 * Math.ceil(fractionalHour * 4) / 4; // Round up to nearest quarter hour
                }
                remainingHours -= nightHours;
            }
        }

        return Math.round(price * 100) / 100; // Round to 2 decimal places
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to make a reservation.');
            navigate('/login');
            return;
        }
        if (!bookingData.carId) {
            alert('Please select a car for your reservation.');
            return;
        }
        const price = calculatePrice();
        const reservationData = {
            ...bookingData,
            userId: currentUser.uid,
            price,
            status: 'pending'
        };
        try {
            const docRef = await addDoc(collection(db, 'reservations'), reservationData);
            const paymentState = {
                reservationId: docRef.id,
                ...reservationData,
                arrivalTime: `${bookingData.arrivalHour}:${bookingData.arrivalMinute}`,
                exitTime: `${bookingData.exitHour}:${bookingData.exitMinute}`
            };
            console.log("Navigating to payment with state:", paymentState);
            navigate('/payment', { state: paymentState });
        } catch (error) {
            console.error("Error creating reservation: ", error);
        }
    };

    const generateOptions = (start, end, step = 1) => {
        return Array.from({ length: (end - start) / step + 1 }, (_, i) => {
            const value = start + (i * step);
            return <option key={value} value={value.toString().padStart(2, '0')}>{value.toString().padStart(2, '0')}</option>;
        });
    };

    return (
        <div className="book-online-container">
            <h1>Book Your Parking Space</h1>
            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                    <label htmlFor="carParkName">Car Park Name:</label>
                    <input
                        type="text"
                        id="carParkName"
                        name="carParkName"
                        value={bookingData.carParkName}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions">
                            {suggestions.map((suggestion) => (
                                <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="carId">Select Car:</label>
                    <select
                        id="carId"
                        name="carId"
                        value={bookingData.carId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a car</option>
                        {userCars.map(car => (
                            <option key={car.id} value={car.id}>
                                {car.carName} - {car.make} {car.model} ({car.licensePlate})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="arrivalDate">Arrival Date:</label>
                    <input
                        type="date"
                        id="arrivalDate"
                        name="arrivalDate"
                        value={bookingData.arrivalDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Arrival Time:</label>
                    <div className="time-inputs">
                        <select
                            name="arrivalHour"
                            value={bookingData.arrivalHour}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Hour</option>
                            {generateOptions(0, 23)}
                        </select>
                        <select
                            name="arrivalMinute"
                            value={bookingData.arrivalMinute}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Minute</option>
                            {generateOptions(0, 45, 15)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="exitDate">Exit Date:</label>
                    <input
                        type="date"
                        id="exitDate"
                        name="exitDate"
                        value={bookingData.exitDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Exit Time:</label>
                    <div className="time-inputs">
                        <select
                            name="exitHour"
                            value={bookingData.exitHour}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Hour</option>
                            {generateOptions(0, 23)}
                        </select>
                        <select
                            name="exitMinute"
                            value={bookingData.exitMinute}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Minute</option>
                            {generateOptions(0, 45, 15)}
                        </select>
                    </div>
                </div>
                <button type="submit" className="submit-button">Book Now</button>
            </form>
        </div>
    );
};

export default BookOnline;