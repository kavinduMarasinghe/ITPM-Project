import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./index.css";

import AppShell from "./components/AppShell.jsx";
import FinancialDashboard from "./pages/FinancialDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SponsorApply from "./pages/SponsorApply.jsx";
import OrganizerApproveAndPay from "./pages/OrganizerApproveAndPay.jsx";
import SponsorDashboard from "./pages/SponsorDashboard.jsx";

function HomeRedirect() {
  const isAuthenticated = localStorage.getItem("financial-app-auth") === "true";
  return <Navigate to={isAuthenticated ? "/organizer/dashboard" : "/login"} replace />;
}

function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("financial-app-auth") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/organizer/dashboard"
            element={
              <RequireAuth>
                <FinancialDashboard />
              </RequireAuth>
            }
          />
          <Route path="/sponsor/apply" element={<SponsorApply />} />
          <Route path="/organizer/approve" element={<OrganizerApproveAndPay />} />
          <Route path="/sponsor/dashboard/:requestId" element={<SponsorDashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </React.StrictMode>
);
