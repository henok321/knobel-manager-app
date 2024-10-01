import { loginSuccess } from './authReducer';
import store from '../store/store.ts'; // Your auth actions

const rehydrateAuthState = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    store.dispatch(loginSuccess(user));
    return true;
  }
  return false;
};

export default rehydrateAuthState;
