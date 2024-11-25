// src/component/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ locationTitle, onClose }) => {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState({
        arrivalDate: '',
        arrivalTime: '',
        exitDate: '',
        exitTime: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Booking submitted:', { ...bookingData, locationTitle });
        navigate('/book-online', { state: { bookingData, locationTitle } });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Book Parking at {locationTitle}</h2>
                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="arrivalTime">Arrival Time:</label>
                        <input
                            type="time"
                            id="arrivalTime"
                            name="arrivalTime"
                            value={bookingData.arrivalTime}
                            onChange={handleInputChange}
                            required
                        />
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
                        <label htmlFor="exitTime">Exit Time:</label>
                        <input
                            type="time"
                            id="exitTime"
                            name="exitTime"
                            value={bookingData.exitTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit">Book Now</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;