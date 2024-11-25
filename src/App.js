import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './component/Header';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import BookOnline from './pages/BookOnline';
import Membership from './pages/Membership';
import WhatsOn from './pages/WhatsOn';
import UserProfile from './pages/UserProfile';
import ReservationHistory from './pages/ReservationHistory';
import PaymentHistory from './pages/PaymentHistory';
import InitializeDatabase from './component/InitializeDatabase';
import Payment from './pages/Payment';
import Admin from './pages/Admin';
import Revenue from './pages/Revenue';
import SearchUser from './pages/SearchUser';
import UserProfileAdmin from './pages/UserProfileAdmin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book-online" element={<BookOnline />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/whats-on" element={<WhatsOn />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/reservation-history" element={<ReservationHistory />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/admin/initialize" element={<InitializeDatabase />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/revenue" element={<Revenue />} />
          <Route path="/admin/search-user" element={<SearchUser />} />
          <Route path="/admin/user/:userId" element={<UserProfileAdmin />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
