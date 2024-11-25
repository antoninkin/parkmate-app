import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const checkAdminStatus = async (userId) => {
    if (!userId) return false;

    const userDocRef = doc(db, 'admins', userId);
    const userDoc = await getDoc(userDocRef);

    return userDoc.exists() && userDoc.data().role === 'admin';
};