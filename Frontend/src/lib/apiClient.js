import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

