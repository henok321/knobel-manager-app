import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://knobel-manager-service-566295896360.europe-west1.run.app',
});

export default apiClient;
