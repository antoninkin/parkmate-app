import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export const bookParkingSpot = async (userId, locationId, startTime, endTime) => {
    try {
        // Check if the location exists and has available spots
        const locationRef = doc(db, 'parkingLocations', locationId);
        const locationSnap = await getDoc(locationRef);

        if (!locationSnap.exists()) {
            throw new Error('Location not found');
        }

        const locationData = locationSnap.data();
        if (locationData.availableSpots <= 0) {
            throw new Error('No available spots');
        }

        // Create a new reservation
        const reservationId = `${userId}_${locationId}_${startTime}`;
        const reservationRef = doc(db, 'reservations', reservationId);
        await setDoc(reservationRef, {
            userId,
            locationId,
            startTime,
            endTime,
            status: 'active'
        });

        // Update available spots
        await updateDoc(locationRef, {
            availableSpots: locationData.availableSpots - 1
        });

        return reservationId;
    } catch (error) {
        console.error('Error booking parking spot:', error);
        throw error;
    }
};

export const checkReservationStatus = async (reservationId) => {
    try {
        const reservationRef = doc(db, 'reservations', reservationId);
        const reservationSnap = await getDoc(reservationRef);

        if (!reservationSnap.exists()) {
            throw new Error('Reservation not found');
        }

        const reservationData = reservationSnap.data();
        const currentTime = Date.now();

        if (currentTime > reservationData.endTime) {
            // Reservation has ended, update status and free up the spot
            await updateDoc(reservationRef, { status: 'completed' });

            const locationRef = doc(db, 'parkingLocations', reservationData.locationId);
            const locationSnap = await getDoc(locationRef);

            if (locationSnap.exists()) {
                const locationData = locationSnap.data();
                await updateDoc(locationRef, {
                    availableSpots: locationData.availableSpots + 1
                });
            }

            return 'completed';
        }

        return reservationData.status;
    } catch (error) {
        console.error('Error checking reservation status:', error);
        throw error;
    }
};