'use client';

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import useAuth from './authHooks.ts';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [loginAttempted, setLoginAttempted] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, authState } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    if (loginAttempted && !authState.error) {
      navigate('/');
    }
  }, [authState.error, navigate, loginAttempted]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginAttempted(false);
    await login(formData.email, formData.password);
    setLoginAttempted(true);
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>{t('LOGIN_HEADER')}</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            {t('LOGIN_SUBHEADER')}
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            <form onSubmit={handleLogin}>
              <FormControl id="email">
                <FormLabel>{t('LOGIN_EMAIL_INPUT_LABEL')}</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="password">
                {' '}
                <FormLabel>{t('LOGIN_PASSWORD_INPUT_LABEL')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </FormControl>
              <Stack spacing={10}>
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
                {authState.error && (
                  <Alert status="error">
                    <AlertIcon />
                    {authState.error}
                  </Alert>
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
