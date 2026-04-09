import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        const token = parsed?.token || parsed?.user?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to parse userInfo from localStorage:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;