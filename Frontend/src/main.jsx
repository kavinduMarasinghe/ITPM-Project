import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import AppShell from "./components/AppShell.jsx";
import FinancialDashboard from "./pages/FinancialDashboard.jsx";
import SponsorApply from "./pages/SponsorApply.jsx";
import OrganizerApproveAndPay from "./pages/OrganizerApproveAndPay.jsx";
import SponsorDashboard from "./pages/SponsorDashboard.jsx";

function HomeRedirect() {
  return <Navigate to="/organizer/dashboard" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/organizer/dashboard" element={<FinancialDashboard />} />
          <Route path="/sponsor/apply" element={<SponsorApply />} />
          <Route path="/organizer/approve" element={<OrganizerApproveAndPay />} />
          <Route path="/sponsor/dashboard/:requestId" element={<SponsorDashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </React.StrictMode>
);
