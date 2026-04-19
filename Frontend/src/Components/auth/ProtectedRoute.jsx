import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getDashboardRouteForRole, getSession } from "../../services/session";

function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const session = getSession();

  if (!session?.token || !session?.user) {
    const defaultLoginPath = allowedRoles?.includes("student")
      ? "/student/login"
      : "/login";

    return (
      <Navigate
        replace
        to={defaultLoginPath}
        state={{
          from: location.pathname,
          message: "Please sign in to continue.",
        }}
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.user.role)) {
    return (
      <Navigate replace to={getDashboardRouteForRole(session.user.role)} />
    );
  }

  return children;
}

export default ProtectedRoute;
