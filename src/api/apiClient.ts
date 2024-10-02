import axios from 'axios';
import { refreshToken } from './refreshToken.ts';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
  baseURL: 'https://knobel-manager-service-566295896360.europe-west1.run.app',
});

apiClient.interceptors.request.use(
  async (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.idToken) {
        const idToken = user.idToken;
        const decodedToken = jwtDecode(idToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          const refreshedUser = await refreshToken(user.refreshToken);
          if (refreshedUser) {
            localStorage.setItem('user', JSON.stringify(refreshedUser));
            config.headers.Authorization = `Bearer ${refreshedUser.idToken}`;
          } else {
            localStorage.removeItem('user');
          }
        } else {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
