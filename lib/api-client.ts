import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'https://mes-backend-47zl.onrender.com',
  withCredentials: true, // Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;