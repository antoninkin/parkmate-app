import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            <div className="admin-buttons">
                <button onClick={() => navigate('/admin/revenue')}>Revenue</button>
                <button onClick={() => navigate('/admin/search-user')}>Search User</button>
            </div>
        </div>
    );
};

export default Admin;