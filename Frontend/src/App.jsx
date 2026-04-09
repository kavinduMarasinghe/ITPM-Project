import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AdminLayout from './components/AdminLayout';
import VendorLayout from './components/VendorLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages (no layout)
import Home from './pages/Home';
import Login from './pages/auth/Login';
import RegisterVendor from './pages/auth/RegisterVendor';
import RegisterAdmin from './pages/auth/RegisterAdmin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddStall from './pages/admin/AddStall';
import StallList from './pages/admin/StallList';
import EditStall from './pages/admin/EditStall';
import BookingRequests from './pages/admin/BookingRequests';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorStalls from './pages/vendor/VendorStalls';
import BookingRequestForm from './pages/vendor/BookingRequestForm';
import MyBookings from './pages/vendor/MyBookings';
import PaymentForm from './pages/vendor/PaymentForm';
import BookingPayment from './pages/vendor/BookingPayment';

// Shared Pages
import StallLayoutMap from './pages/StallLayoutMap';
import StallDetails from './pages/StallDetails';
import ProfileSettings from './pages/shared/ProfileSettings';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{ 
          duration: 3500,
          style: { 
            background: '#1e293b', 
            color: '#fff', 
            borderRadius: '14px', 
            padding: '14px 20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            borderLeft: '5px solid #00a651'
          },
          success: {
            iconTheme: { primary: '#00a651', secondary: '#fff' },
            style: { borderLeftColor: '#00a651' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeftColor: '#ef4444' }
          }
        }} 
      />
      <Router>
        <Routes>
          {/* ── PUBLIC PAGES (no sidebar) ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/vendor" element={<RegisterVendor />} />
          <Route path="/register/admin" element={<RegisterAdmin />} />

          {/* ── ADMIN ROUTES ── */}
          <Route path="/admin/stalls" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/stalls/add" element={<ProtectedRoute allowedRole="admin"><AdminLayout><AddStall /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/stalls/list" element={<ProtectedRoute allowedRole="admin"><AdminLayout><StallList /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/stalls/edit/:id" element={<ProtectedRoute allowedRole="admin"><AdminLayout><EditStall /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/stalls/requests" element={<ProtectedRoute allowedRole="admin"><AdminLayout><BookingRequests /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/stalls/layout" element={<ProtectedRoute allowedRole="admin"><AdminLayout><StallLayoutMap role="admin" /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminLayout><ProfileSettings /></AdminLayout></ProtectedRoute>} />

          {/* ── VENDOR ROUTES ── */}
          <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><VendorDashboard /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/stalls" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><VendorStalls /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/stalls/request/:stallId" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><BookingRequestForm /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/stalls/layout" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><StallLayoutMap role="vendor" /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/my-bookings" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><MyBookings /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/payment" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><PaymentForm /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/booking-payment" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><BookingPayment /></VendorLayout></ProtectedRoute>} />
          <Route path="/vendor/profile" element={<ProtectedRoute allowedRole="vendor"><VendorLayout><ProfileSettings /></VendorLayout></ProtectedRoute>} />

          {/* ── SHARED ── */}
          <Route path="/stalls/:id" element={<StallDetails />} />

          {/* ── FALLBACK ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;