// src/component/
import React, { useState, useContext, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { checkAdminStatus } from '../utils/authUtils';

// Import your JSON files
import adminsData from '../data/admins.json';
import carsData from '../data/cars.json';
import historyData from '../data/history.json';
import metricsData from '../data/metrics.json';
import parkingLocationsData from '../data/parkingLocations.json';
import parkingSlotsData from '../data/parkingSlots.json';
import paymentsData from '../data/payments.json';
import reservationsData from '../data/reservations.json';
import usersData from '../data/users.json';

const InitializeDatabase = () => {
    const [message, setMessage] = useState('');
    const [isInitializing, setIsInitializing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        console.log("Current user changed:", currentUser?.uid);
        console.log("Is admin:", isAdmin);
    }, [currentUser, isAdmin]);

    const dataFiles = [
        { name: 'Admins', data: adminsData.admins, collection: 'admins' },
        { name: 'Cars', data: carsData.cars, collection: 'cars' },
        { name: 'History', data: historyData.history, collection: 'history' },
        { name: 'Metrics', data: metricsData.metrics, collection: 'metrics' },
        { name: 'Parking Locations', data: parkingLocationsData.parkingLocations, collection: 'parkingLocations' },
        { name: 'Parking Slots', data: parkingSlotsData.parkingSlots, collection: 'parkingSlots' },
        { name: 'Payments', data: paymentsData.payments, collection: 'payments' },
        { name: 'Reservations', data: reservationsData.reservations, collection: 'reservations' },
        { name: 'Users', data: usersData.users, collection: 'users' },
    ];

    useEffect(() => {
        const checkAdmin = async () => {
            if (currentUser) {
                const adminStatus = await checkAdminStatus(currentUser.uid);
                setIsAdmin(adminStatus);
            } else {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, [currentUser]);

    const createAdminProfile = async () => {
        console.log("createAdminProfile function called");
        if (!currentUser) {
            console.log("No current user found");
            setMessage('Please log in to create an admin profile.');
            return;
        }

        console.log("Current user:", currentUser.uid);
        try {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            console.log("Admin document reference created");

            await setDoc(adminDocRef, {
                email: currentUser.email,
                role: 'admin'
            });
            console.log("Admin document set successfully");

            setMessage('Admin profile created successfully!');
            setIsAdmin(true);
            console.log("Admin status updated in component state");
        } catch (error) {
            console.error('Error creating admin profile:', error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            setMessage('Error creating admin profile. Check console for details.');
        }
    };

    const initializeCollection = async (collectionName, data) => {
        console.log(`Initializing collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);

        for (const [id, item] of Object.entries(data)) {
            console.log(`Adding document with ID: ${id} to collection ${collectionName}`);
            try {
                await setDoc(doc(collectionRef, id), item);
                console.log(`Document ${id} added successfully to ${collectionName}`);
            } catch (error) {
                console.error(`Error adding document ${id} to ${collectionName}:`, error);
                console.error("Error details:", JSON.stringify(error, null, 2));
                throw error;
            }
        }
    };

    const initializeAllData = async () => {
        if (!auth.currentUser) {
            console.error("User not authenticated");
            setMessage('Please log in to initialize the database.');
            return;
        }

        setIsInitializing(true);
        console.log("Starting initialization of all data");
        try {
            for (const file of dataFiles) {
                console.log(`Processing ${file.name}`);
                await initializeCollection(file.collection, file.data);
                setMessage(prevMessage => `${prevMessage}${file.name} initialized. `);
            }
            setMessage(prevMessage => `${prevMessage}All data initialized successfully!`);
            console.log("All data initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            setMessage('Error initializing database. Check console for details.');
        } finally {
            setIsInitializing(false);
        }
    };

    const testInitialization = async () => {
        if (!currentUser) {
            console.error("User not authenticated");
            setMessage('Please log in to test initialization.');
            return;
        }

        if (!isAdmin) {
            console.error("User is not an admin");
            setMessage('You must be an admin to test initialization.');
            return;
        }

        setIsInitializing(true);
        console.log("Starting test initialization");
        try {
            const testData = { testId: { field1: "value1", field2: "value2" } };
            await initializeCollection("test", testData);
            setMessage("Test initialization successful!");
            console.log("Test initialization successful");
        } catch (error) {
            console.error("Error in test initialization:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            setMessage('Error in test initialization. Check console for details.');
        } finally {
            setIsInitializing(false);
        }
    };

    const initializeSpecificCollection = async (collectionName, data, name) => {
        if (!currentUser) {
            setMessage('Please log in to initialize the database.');
            return;
        }

        if (!isAdmin) {
            setMessage('You must be an admin to initialize the database.');
            return;
        }

        setIsInitializing(true);
        console.log(`Initializing specific collection: ${name}`);
        try {
            await initializeCollection(collectionName, data);
            setMessage(`${name} data initialized successfully!`);
            console.log(`${name} data initialized successfully`);
        } catch (error) {
            console.error(`Error initializing ${name} data:`, error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            setMessage(`Error initializing ${name} data. Check console for details.`);
        } finally {
            setIsInitializing(false);
        }
    };

    return (
        <div className="initialize-database">
            <h2>Database Administration</h2>
            {currentUser ? (
                isAdmin ? (
                    <>
                        <p>Welcome, Admin!</p>
                        <button onClick={initializeAllData} className="init-button all" disabled={isInitializing}>
                            {isInitializing ? 'Initializing...' : 'Initialize All Data'}
                        </button>
                        <button onClick={testInitialization} className="init-button" disabled={isInitializing}>
                            {isInitializing ? 'Testing...' : 'Test Initialization'}
                        </button>

                        <div className="collection-buttons">
                            {dataFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => initializeSpecificCollection(file.collection, file.data, file.name)}
                                    className="init-button"
                                    disabled={isInitializing}
                                >
                                    {isInitializing ? 'Initializing...' : `Initialize ${file.name}`}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <p>You are not an admin. Would you like to create an admin profile?</p>
                        <button onClick={() => {
                            console.log("Create Admin Profile button clicked");
                            createAdminProfile();
                        }} className="init-button">
                            Create Admin Profile
                        </button>

                    </>
                )
            ) : (
                <p>Please log in to access database administration.</p>
            )}
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default InitializeDatabase;