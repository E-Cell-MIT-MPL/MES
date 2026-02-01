import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;