import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import BookingRequests from "../../pages/admin/BookingRequests";
import OrganizerSidebarLayout from "./OrganizerSidebarLayout";

function OrganizerStallRequests() {
  const navigate = useNavigate();
  const session = getSession();
  const organizationName = session?.user?.organizationName || "Organization";

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      if (session?.token) {
        await api.logout();
      }
    } catch (_err) {
      // Clear local session even if backend logout fails.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, session]);

  return (
    <OrganizerSidebarLayout
      organizationName={organizationName}
      activeSection="stalls"
      onSectionChange={(sectionId) => {
        if (sectionId === "events") {
          navigate("/organizerteamdashboard");
        }
      }}
      onLogout={handleLogout}
      loggingOut={loggingOut}
      onShowRules={() => {}}
    >
      <BookingRequests />
    </OrganizerSidebarLayout>
  );
}

export default OrganizerStallRequests;
