import { Routes, Route } from "react-router-dom";

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
import OrganizerTeamDashboard from "./Components/organizers/OrganizerTeamDashboard";

// 🔹 Layouts
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

// 🔹 App
function App() {
  return (
    <div className="App">
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Homepage />} />

        <Route
          path="/register/organization"
          element={
            <ShellLayout>
              <OrganizerRegistration />
            </ShellLayout>
          }
        />

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

        <Route
          path="/student/register"
          element={
            <ShellLayout>
              <StudentRegistration />
            </ShellLayout>
          }
        />

        {/* TEMP: WITHOUT ProtectedRoute (FOR DEBUG) */}
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
      </Routes>
    </div>
  );
}

export default App;