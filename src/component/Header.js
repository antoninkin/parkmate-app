import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { checkAdminStatus } from '../utils/authUtils';
import './Header.css';

const Header = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (currentUser) {
                const adminStatus = await checkAdminStatus(currentUser.uid);
                setIsAdmin(adminStatus);
            }
        };
        checkAdmin();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <header>
            <nav>
                <ul>
                    <li>
                        <Link to="/" className="logo-button">
                            <img src="/logo.svg" width="200" height="50" alt="parkmate logo" />
                        </Link>
                    </li>
                    <li><Link to="/book-online">Book Online</Link></li>
                    <li><Link to="/membership">Membership</Link></li>
                    <li><Link to="/whats-on">What's On</Link></li>
                    {currentUser ? (
                        <>
                            <li>
                                <Link to={isAdmin ? "/admin" : "/profile"}>
                                    {isAdmin ? `Admin (${currentUser.email})` : `Profile (${currentUser.email})`}
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="logout-button">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li><Link to="/login">Login</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;