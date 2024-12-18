import { AuthProvider, AuthResponse, SignInPage } from '@toolpad/core';
import useUser from '../auth/authHook.ts';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/user/userSlice.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '../../firebase.ts';

const Login = () => {
  const { login, userState } = useUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        const userInfo = {
          email: user.email || '',
          uid: user.uid,
          displayName: user.displayName || '',
        };
        dispatch(setUser(userInfo));
      } else {
        dispatch(setUser(null));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const signIn = async (
    provider: AuthProvider,
    formData: FormData,
  ): Promise<AuthResponse> => {
    if (provider.id === 'credentials') {
      const email = formData.get('email') as string | null;
      const password = formData.get('password') as string | null;
      if (email && password) {
        await login(email, password);
        if (userState.error) {
          return { success: 'false', error: userState.error };
        }
        return { success: 'true' };
      }
      return { success: 'false' };
    }
    return { success: 'false' };
  };

  if (loading) {
    return null;
  }

  return (
    <SignInPage
      providers={[{ id: 'credentials', name: 'Firebase' }]}
      signIn={signIn}
    />
  );
};

export default Login;
