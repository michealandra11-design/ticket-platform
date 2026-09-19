// src/api/api.js
import axios from "axios";

// Generous timeout: the backend runs on Render's free tier, which sleeps
// after inactivity and can take up to ~50s to wake on the next request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
