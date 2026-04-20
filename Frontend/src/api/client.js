import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const setDevRole = (role) => {
  api.defaults.headers.common["x-dev-role"] = role;
};
