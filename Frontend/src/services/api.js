import { getAuthToken } from "./session";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const config = {
    method: options.method || "GET",
    headers,
  };

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    config.body =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Request failed.");
  }

  return payload;
}

export const api = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },
  logout() {
    return request("/auth/logout", {
      method: "POST",
      auth: true,
    });
  },
  registerStudent(studentData) {
    return request("/students/register", {
      method: "POST",
      body: studentData,
    });
  },
  registerOrganizer(organizerData) {
    return request("/organizers/register", {
      method: "POST",
      body: organizerData,
    });
  },
 
  createEventRequest(eventData) {
    return request("/events", {
      method: "POST",
      auth: true,
      body: eventData,
    });
  },
  getMyEvents() {
    return request("/events/my-events", {
      auth: true,
    });
  },
  getAdminEvents() {
    return request("/events/admin", {
      auth: true,
    });
  },
  getAdminEventStats() {
    return request("/events/admin/stats", {
      auth: true,
    });
  },
  reviewEvent(id, payload) {
    return request(`/events/${id}/review`, {
      method: "PUT",
      auth: true,
      body: payload,
    });
  },
  publishEvent(id) {
    return request(`/events/${id}/publish`, {
      method: "PUT",
      auth: true,
    });
  },
  cancelEvent(id) {
    return request(`/events/${id}/cancel`, {
      method: "PUT",
      auth: true,
    });
  },
  deleteEvent(id) {
    return request(`/events/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
  getPublishedEvents() {
    return request("/events/published", {
      auth: true,
    });
  },
  getRecommendedEvents(limit = 4) {
    return request(`/events/recommended?limit=${encodeURIComponent(limit)}`, {
      auth: true,
    });
  },
  trackEventClick(id) {
    return request(`/events/${id}/click`, {
      method: "POST",
      auth: true,
    });
  },
};
