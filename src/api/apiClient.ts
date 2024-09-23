import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com/', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for request/response
// apiClient.interceptors.request.use(...);
// apiClient.interceptors.response.use(...);

export default apiClient;
