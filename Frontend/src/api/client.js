import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request/response logging interceptor
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method.toUpperCase(), config.url, "Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.status, error.config.url, error.response?.data);
    return Promise.reject(error);
  }
);

export const setDevRole = (role) => {
  api.defaults.headers.common["x-dev-role"] = role;
  console.log("Set dev role:", role);
};
