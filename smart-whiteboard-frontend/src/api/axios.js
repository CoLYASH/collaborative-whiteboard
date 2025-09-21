// axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/auth', // ✅ must match backend port and route prefix
  withCredentials: true,
});

export default api;
