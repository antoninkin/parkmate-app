import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './SearchUser.css';

const SearchUser = () => {
    const navigate = useNavigate();
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const handleSearch = async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", searchEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setSearchResult({ id: querySnapshot.docs[0].id, ...userData });
        } else {
            setSearchResult(null);
            alert('User not found');
        }
    };

    const handleViewProfile = () => {
        navigate(`/admin/user/${searchResult.id}`);
    };

    return (
        <div className="search-user-page">
            <h1>Search User</h1>
            <div className="search-bar">
                <input
                    type="email"
                    placeholder="Enter user email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {searchResult && (
                <div className="search-result">
                    <h2>User Found:</h2>
                    <p>Email: {searchResult.email}</p>
                    <p>Name: {searchResult.firstName} {searchResult.lastName}</p>
                    <button onClick={handleViewProfile}>View Full Profile</button>
                </div>
            )}
            <button onClick={() => navigate('/admin')} className="back-button">Back to Admin Page</button>
        </div>
    );
};

export default SearchUser;