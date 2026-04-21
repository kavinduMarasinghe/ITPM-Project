import React from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import RegisterAdmin from './pages/auth/RegisterAdmin'
import RegisterVendor from './pages/auth/RegisterVendor'
import StallDetails from './pages/StallDetails'
import StallLayoutMap from './pages/StallLayoutMap'
import AdminLayout from './components/AdminLayout'
import VendorLayout from './components/VendorLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import StallList from './pages/admin/StallList'
import AddStall from './pages/admin/AddStall'
import EditStall from './pages/admin/EditStall'
import BookingRequests from './pages/admin/BookingRequests'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorStalls from './pages/vendor/VendorStalls'
import MyBookings from './pages/vendor/MyBookings'
import BookingRequestForm from './pages/vendor/BookingRequestForm'
import PaymentForm from './pages/vendor/PaymentForm'
import EventList from './pages/vendor/EventList'
import EventDetails from './pages/vendor/EventDetails'
import BookingPayment from './pages/vendor/BookingPayment'
import ProfileSettings from './pages/shared/ProfileSettings'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register-admin' element={<RegisterAdmin />} />
          <Route path='/register-vendor' element={<RegisterVendor />} />
          <Route path='/stall/:id' element={<StallDetails />} />
          <Route path='/map' element={<StallLayoutMap />} />
          <Route path='/profile' element={<ProfileSettings />} />
          
          <Route path='/admin' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='stalls' element={<StallList />} />
            <Route path='stalls/list' element={<StallList />} />
            <Route path='stalls/add' element={<AddStall />} />
            <Route path='stalls/edit/:id' element={<EditStall />} />
            <Route path='stalls/requests' element={<BookingRequests />} />
            <Route path='stalls/layout' element={<StallLayoutMap role="admin" />} />
            <Route path='add-stall' element={<AddStall />} />
            <Route path='edit-stall/:id' element={<EditStall />} />
            <Route path='bookings' element={<BookingRequests />} />
          </Route>
          
          <Route path='/vendor' element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<VendorDashboard />} />
            <Route path='dashboard' element={<VendorDashboard />} />
            <Route path='stalls' element={<VendorStalls />} />
            <Route path='stalls/layout' element={<StallLayoutMap role="vendor" />} />
            <Route path='stalls/request/:stallId' element={<BookingRequestForm />} />
            <Route path='bookings' element={<MyBookings />} />
            <Route path='my-bookings' element={<MyBookings />} />
            <Route path='request' element={<BookingRequestForm />} />
            <Route path='payment' element={<PaymentForm />} />
            <Route path='events' element={<EventList />} />
            <Route path='event/:id' element={<EventDetails />} />
            <Route path='booking-payment' element={<BookingPayment />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
