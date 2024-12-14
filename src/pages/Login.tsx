'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import useUser from '../auth/authHook.ts';
import { setUser } from '../store/user/userSlice.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '../../firebase.ts';
import { useDispatch } from 'react-redux';
import { CenteredSpinner } from '../components/CenteredSpinner.tsx';
import { Field } from '../components/ui/field.tsx';
import { Alert } from '../components/ui/alert.tsx';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const { t } = useTranslation();
  const { login, userState } = useUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(formData.email, formData.password);
  };

  if (loading) {
    return <CenteredSpinner />;
  }

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'}>
      <Stack gap={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>{t('LOGIN_HEADING')}</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            {t('LOGIN_SUBHEADER')}
          </Text>
        </Stack>
        <Box rounded={'lg'} boxShadow={'lg'} p={8}>
          <Stack gap={4}>
            <form onSubmit={handleLogin}>
              <Field id="email" label={t('LOGIN_EMAIL_INPUT_LABEL')}>
                <Input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field id="password" label={t('LOGIN_PASSWORD_INPUT_LABEL')}>
                <Input
                  type="password"
                  required
                  name="password"
                  onChange={handleChange}
                />
              </Field>
              <Stack gap={10}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'}
                  justify={'space-between'}
                >
                  <Text color={'blue.400'}>
                    {t('LOGIN_FORGOT_PASSWORD_LINK')}
                  </Text>
                </Stack>
                <Button
                  type="submit"
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  {t('LOGIN_SIGN_IN_BUTTON')}
                </Button>
                {userState.error && (
                  <Alert status="error">{userState.error}</Alert>
                )}
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
