import { BrowserRouter, Routes, Route } from "react-router-dom";


import Navbar from "./components/Navbar";
import SponsorApply from "./pages/SponsorApply";
import OrganizerApproveAndPay from "./pages/OrganizerApproveAndPay";
import SponsorDashboard from "./pages/SponsorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen backdrop-blur-sm bg-black/40">
              <Navbar />
              <SponsorApply />
            </div>
          }
        />
        <Route
          path="/sponsor/apply"
          element={
            <div className="min-h-screen backdrop-blur-sm bg-black/40">
              <Navbar />
              <SponsorApply />
            </div>
          }
        />
        <Route
          path="/organizer/approve"
          element={
            <div className="min-h-screen backdrop-blur-sm bg-black/40">
              <Navbar />
              <OrganizerApproveAndPay />
            </div>
          }
        />
        <Route
          path="/sponsor/dashboard/:requestId"
          element={
            <div className="min-h-screen backdrop-blur-sm bg-black/40">
              <Navbar />
              <SponsorDashboard />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}