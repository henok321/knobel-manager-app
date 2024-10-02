import axios from 'axios';
import { firebaseConfig } from '../../firebase.ts';

const API_KEY = firebaseConfig.apiKey;

export const refreshToken = async (refreshToken: string) => {
  const data = new URLSearchParams();
  data.append('grant_type', 'refresh_token');
  data.append('refresh_token', refreshToken);

  const response = await axios.post(
    `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const resData = response.data;
  return {
    ...resData,
    email: resData.email,
    uid: resData.sub,
    idToken: resData.idToken,
    refreshToken: resData.refreshToken,
  };
};
