import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubscribe = () => {
        if (email && validateEmail(email)) {
            setMessage(`The email ${email} will now receive a newsletter.`);
            setEmail('');
        } else {
            setMessage('Please enter a valid email address.');
        }
    };

    return (
        <footer>
            <div className="row primary">
                <div className="column content">
                    <div className="subscribe">
                        <p>Subscribe to Our Newsletter</p>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button onClick={handleSubscribe}>Subscribe</button>
                        </div>
                        {message && <p>{message}</p>}
                    </div>
                    <div className="footer-menu">
                        <Link to="/">Home</Link>
                        <Link to="/cookie-policy">Cookie Policy</Link>
                        <Link to="/terms-of-service">Terms of service</Link>
                        <Link to="/support">Support</Link>
                    </div>
                    <p className="copyright">Copyright &copy; {new Date().getFullYear()} ParkMate</p>
                </div>
                <div className="column about">
                    <p>ParkMate Parking Management Systems</p>
                    <p>Revolutionizing parking solutions for a smarter, more efficient future.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;