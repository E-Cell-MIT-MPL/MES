import axios from 'axios';

const apiClient = axios.create({
  // It checks for the environment variable first; if missing, it falls back to localhost
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'localhost:8080',
  withCredentials: true, // 👈 REQUIRED for your JWT cookies to work
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;