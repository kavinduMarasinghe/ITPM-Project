const STORAGE_KEY = "eventaura.session";

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession() {
  const storedSession = localStorage.getItem(STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch (error) {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return getSession()?.token || "";
}

export function getDashboardRouteForRole(role) {
  switch (role) {
    case "student":
      return "/events";
    case "organizer":
      return "/organizerteamdashboard";
    case "admin":
      return "/admindashboard";
    case "hod":
      return "/hodashboard";
    default:
      return "/login";
  }
}
