'use client';

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, FormEvent, useState } from 'react';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
                  <Checkbox
                    checked={formData.rememberMe}
                    name="rememberMe"
                    onChange={handleChange}
                  >
                    {t('LOGIN_REMEMBER_ME_CHECKBOX_LABEL')}
                  </Checkbox>
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
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
