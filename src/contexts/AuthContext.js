import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let adminUnsubscribe = null;

        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (adminUnsubscribe) {
                adminUnsubscribe();
                adminUnsubscribe = null;
            }

            if (user) {
                // Real-time admin status: reacts immediately if access is revoked
                adminUnsubscribe = onSnapshot(
                    doc(db, 'admins', user.uid),
                    (snapshot) => {
                        setIsAdmin(snapshot.exists());
                        setLoading(false);
                    },
                    () => {
                        setIsAdmin(false);
                        setLoading(false);
                    }
                );
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (adminUnsubscribe) adminUnsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const value = {
        currentUser,
        setCurrentUser,
        isAdmin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
