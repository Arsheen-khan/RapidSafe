// Axios instance configured for the ambulance backend.
import axios from "axios";

export const API_BASE = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
