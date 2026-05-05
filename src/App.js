import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './component/Header';
import Footer from './component/Footer';
import ProtectedRoute from './component/ProtectedRoute';
import AdminRoute from './component/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import BookOnline from './pages/BookOnline';
import Membership from './pages/Membership';
import WhatsOn from './pages/WhatsOn';
import UserProfile from './pages/UserProfile';
import ReservationHistory from './pages/ReservationHistory';
import PaymentHistory from './pages/PaymentHistory';
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
          <Route path="/membership" element={<Membership />} />
          <Route path="/whats-on" element={<WhatsOn />} />
          <Route path="/book-online" element={<ProtectedRoute><BookOnline /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/reservation-history" element={<ProtectedRoute><ReservationHistory /></ProtectedRoute>} />
          <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><Revenue /></AdminRoute>} />
          <Route path="/admin/search-user" element={<AdminRoute><SearchUser /></AdminRoute>} />
          <Route path="/admin/user/:userId" element={<AdminRoute><UserProfileAdmin /></AdminRoute>} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
