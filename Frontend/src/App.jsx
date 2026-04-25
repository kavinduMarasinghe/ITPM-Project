import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Stall management
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import RegisterAdmin from "./pages/auth/RegisterAdmin";
import RegisterVendor from "./pages/auth/RegisterVendor";
import StallDetails from "./pages/StallDetails";
import StallLayoutMap from "./pages/StallLayoutMap";
import AdminLayout from "./Components/AdminLayout";
import VendorLayout from "./Components/VendorLayout";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StallList from "./pages/admin/StallList";
import AddStall from "./pages/admin/AddStall";
import EditStall from "./pages/admin/EditStall";
import BookingRequests from "./pages/admin/BookingRequests";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorStalls from "./pages/vendor/VendorStalls";
import MyBookings from "./pages/vendor/MyBookings";
import BookingRequestForm from "./pages/vendor/BookingRequestForm";
import EventList from "./pages/vendor/EventList";
import EventDetails from "./pages/vendor/EventDetails";
import BookingPayment from "./pages/vendor/BookingPayment";
import PaymentCheckout from "./pages/vendor/PaymentCheckout";
import ProfileSettings from "./pages/shared/ProfileSettings";
import VendorBarcode from "./pages/vendor/VendorBarcode";
import ScanAttendance from "./pages/shared/ScanAttendance";
import AttendanceLogs from "./pages/admin/AttendanceLogs";

// EventAura
import LoginPage from "./Components/auth/LoginPage";
import StudentRegistration from "./Components/auth/StudentRegistration";
import EventRequestForm from "./Components/events/EventRequestForm";
import EventsPage from "./Components/events/EventsPage";
import Homepage from "./Components/home/Homepage";
import Footer from "./Components/layout/Footer";
import Header from "./Components/layout/Header";
import AdminEventDashboard from "./Components/organizers/AdminEventDashboard";
import HeadOrganizerDashboard from "./Components/organizers/HeadOrganizerDashboard";
import OrganizerRegistration from "./Components/organizers/OrganizersReg";
import OrganizerStallRequests from "./Components/organizers/OrganizerStallRequests";
import OrganizerTeamDashboard from "./Components/organizers/OrganizerTeamDashboard";

import "./App.css";

function ShellLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function FooterLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<Homepage />} />

        {/* Stall management public */}
        <Route path="/stalls" element={<Home />} />
        <Route path="/stall/:id" element={<StallDetails />} />
        <Route path="/map" element={<StallLayoutMap />} />
        <Route path="/profile" element={<ProfileSettings />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <ShellLayout>
              <LoginPage defaultPortal="staff" />
            </ShellLayout>
          }
        />
        <Route
          path="/student/login"
          element={
            <ShellLayout>
              <LoginPage defaultPortal="student" />
            </ShellLayout>
          }
        />
        <Route path="/staff/login" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/register-vendor" element={<RegisterVendor />} />
        <Route
          path="/student/register"
          element={
            <ShellLayout>
              <StudentRegistration />
            </ShellLayout>
          }
        />
        <Route
          path="/register/organization"
          element={
            <ShellLayout>
              <OrganizerRegistration />
            </ShellLayout>
          }
        />

        {/* EventAura events / dashboards */}
        <Route
          path="/events"
          element={
            <ShellLayout>
              <EventsPage />
            </ShellLayout>
          }
        />
        <Route
          path="/eventrequest"
          element={
            <FooterLayout>
              <EventRequestForm />
            </FooterLayout>
          }
        />
        <Route
          path="/hodashboard"
          element={
            <FooterLayout>
              <HeadOrganizerDashboard />
            </FooterLayout>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <FooterLayout>
              <AdminEventDashboard />
            </FooterLayout>
          }
        />
        <Route
          path="/organizerteamdashboard"
          element={
            <FooterLayout>
              <OrganizerTeamDashboard />
            </FooterLayout>
          }
        />
        <Route
          path="/organizer/stalls"
          element={
            <FooterLayout>
              <OrganizerStallRequests />
            </FooterLayout>
          }
        />

        {/* Stall management admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="stalls" element={<StallList />} />
          <Route path="stalls/list" element={<StallList />} />
          <Route path="stalls/add" element={<AddStall />} />
          <Route path="stalls/edit/:id" element={<EditStall />} />
          <Route path="stalls/requests" element={<BookingRequests />} />
          <Route path="stalls/layout" element={<StallLayoutMap role="admin" />} />
          <Route path="add-stall" element={<AddStall />} />
          <Route path="edit-stall/:id" element={<EditStall />} />
          <Route path="bookings" element={<BookingRequests />} />
          <Route path="attendance/scan" element={<ScanAttendance />} />
          <Route path="attendance/scan/:token" element={<ScanAttendance />} />
          <Route path="attendance/logs" element={<AttendanceLogs />} />
        </Route>

        {/* Stall management vendor */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="stalls" element={<VendorStalls />} />
          <Route path="stalls/layout" element={<StallLayoutMap role="vendor" />} />
          <Route path="stalls/request/:stallId" element={<BookingRequestForm />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="request" element={<BookingRequestForm />} />
          <Route path="events" element={<EventList />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="booking-payment" element={<BookingPayment />} />
          <Route path="checkout/:bookingId" element={<PaymentCheckout />} />
          <Route path="qr/:bookingId" element={<VendorBarcode />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
