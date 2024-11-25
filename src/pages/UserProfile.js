import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import './UserProfile.css';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        address: ''
    });
    const [cars, setCars] = useState([]);
    const [newCar, setNewCar] = useState({
        carName: '',
        licensePlate: '',
        make: '',
        model: '',
        year: '',
        color: ''
    });
    const [editingCar, setEditingCar] = useState(null);
    const [carErrors, setCarErrors] = useState({});
    const { currentUser } = useContext(AuthContext);

    const fetchCars = useCallback(async () => {
        if (currentUser) {
            const carsCollectionRef = collection(db, 'cars');
            const carsQuery = query(carsCollectionRef, where('userId', '==', currentUser.uid));
            const carsSnapshot = await getDocs(carsQuery);
            setCars(carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser && currentUser.uid) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData(prevData => ({ ...prevData, ...userDoc.data(), email: currentUser.email }));
                    } else {
                        setUserData(prevData => ({ ...prevData, email: currentUser.email }));
                    }
                    await fetchCars();
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [currentUser, fetchCars]);

    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleCarChange = (e) => {
        const { name, value } = e.target;
        if (editingCar) {
            setEditingCar({ ...editingCar, [name]: value });
        } else {
            setNewCar({ ...newCar, [name]: value });
        }
    };

    const validateCar = (car) => {
        let tempErrors = {};
        if (!car.carName.trim()) tempErrors.carName = "Car name is required";
        if (!car.licensePlate.trim()) tempErrors.licensePlate = "License plate is required";
        if (!car.make.trim()) tempErrors.make = "Make is required";
        if (!car.model.trim()) tempErrors.model = "Model is required";
        if (!car.year.trim()) tempErrors.year = "Year is required";
        else if (isNaN(car.year) || car.year < 1900 || car.year > new Date().getFullYear())
            tempErrors.year = `Year must be between 1900 and ${new Date().getFullYear()}`;
        if (!car.color.trim()) tempErrors.color = "Color is required";

        setCarErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleAddCar = async () => {
        if (validateCar(newCar)) {
            try {
                const carsCollectionRef = collection(db, 'cars');
                await addDoc(carsCollectionRef, { ...newCar, userId: currentUser.uid });
                setNewCar({ carName: '', licensePlate: '', make: '', model: '', year: '', color: '' });
                await fetchCars();
            } catch (error) {
                console.error("Error adding car:", error);
                alert('An error occurred while adding the car. Please try again.');
            }
        }
    };

    const handleEditCar = (car) => {
        setEditingCar(car);
    };

    const handleSaveEdit = async () => {
        if (validateCar(editingCar)) {
            try {
                const carDocRef = doc(db, 'cars', editingCar.id);
                await setDoc(carDocRef, editingCar, { merge: true });
                setEditingCar(null);
                await fetchCars();
            } catch (error) {
                console.error("Error updating car:", error);
                alert('An error occurred while updating the car. Please try again.');
            }
        }
    };

    const handleDeleteCar = async (carId) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                const carDocRef = doc(db, 'cars', carId);
                await deleteDoc(carDocRef);
                await fetchCars();
            } catch (error) {
                console.error("Error deleting car:", error);
                alert('An error occurred while deleting the car. Please try again.');
            }
        }
    };

    const saveProfile = async () => {
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, userData, { merge: true });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('An error occurred while updating your profile. Please try again.');
        }
    };

    return (
        <div className="user-profile-container">
            <h2>User Profile</h2>
            <div className="user-profile">
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={userData.firstName} onChange={handleUserDataChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={userData.lastName} onChange={handleUserDataChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input type="tel" id="phone" name="phone" value={userData.phone} onChange={handleUserDataChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={userData.email} onChange={handleUserDataChange} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value={userData.dateOfBirth} onChange={handleUserDataChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input type="text" id="address" name="address" value={userData.address} onChange={handleUserDataChange} />
                </div>
                <button class="user" onClick={saveProfile}>Save Profile</button>
            </div>

            <h3>Registered Cars</h3>
            {cars.map((car) => (
                <div key={car.id} className="car-details">
                    {editingCar && editingCar.id === car.id ? (
                        <>
                            <input name="carName" value={editingCar.carName} onChange={handleCarChange} />
                            <input name="licensePlate" value={editingCar.licensePlate} onChange={handleCarChange} />
                            <input name="make" value={editingCar.make} onChange={handleCarChange} />
                            <input name="model" value={editingCar.model} onChange={handleCarChange} />
                            <input name="year" value={editingCar.year} onChange={handleCarChange} />
                            <input name="color" value={editingCar.color} onChange={handleCarChange} />
                            <button onClick={handleSaveEdit}>Save</button>
                            <button onClick={() => setEditingCar(null)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <p>Car Name: {car.carName}</p>
                            <p>License Plate: {car.licensePlate}</p>
                            <p>Make: {car.make}</p>
                            <p>Model: {car.model}</p>
                            <p>Year: {car.year}</p>
                            <p>Color: {car.color}</p>
                            <button onClick={() => handleEditCar(car)}>Edit</button>
                            <button onClick={() => handleDeleteCar(car.id)}>Delete</button>
                        </>
                    )}
                </div>
            ))}

            <h4>Add New Car</h4>
            <div className="new-car-form">
                <div className="form-group">
                    <label htmlFor="carName">Car Name</label>
                    <input id="carName" name="carName" value={newCar.carName} onChange={handleCarChange} placeholder="Car Name" />
                    {carErrors.carName && <p className="error">{carErrors.carName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="licensePlate">License Plate</label>
                    <input id="licensePlate" name="licensePlate" value={newCar.licensePlate} onChange={handleCarChange} placeholder="License Plate" />
                    {carErrors.licensePlate && <p className="error">{carErrors.licensePlate}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="make">Make</label>
                    <input id="make" name="make" value={newCar.make} onChange={handleCarChange} placeholder="Make" />
                    {carErrors.make && <p className="error">{carErrors.make}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="model">Model</label>
                    <input id="model" name="model" value={newCar.model} onChange={handleCarChange} placeholder="Model" />
                    {carErrors.model && <p className="error">{carErrors.model}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <input id="year" name="year" value={newCar.year} onChange={handleCarChange} placeholder="Year" />
                    {carErrors.year && <p className="error">{carErrors.year}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="color">Color</label>
                    <input id="color" name="color" value={newCar.color} onChange={handleCarChange} placeholder="Color" />
                    {carErrors.color && <p className="error">{carErrors.color}</p>}
                </div>
                <div className="form-group">
                    <button className="add-car-button" onClick={handleAddCar}>Add Car</button>
                </div>
            </div>


            <div className="history-links">
                <Link to="/reservation-history" className="history-link">Reservation History</Link>
                <Link to="/payment-history" className="history-link">Payment History</Link>
            </div>
        </div>
    );
};

export default UserProfile;