import {
  Button,
  Flex,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { hasLength, isEmail, useForm } from '@mantine/form';
import { upperFirst, useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import type { LoginData } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import CenterLoader from '../shared/CenterLoader';
import Layout from '../shared/layout/Layout.tsx';
import { assertNever } from '../utils/assertNever.ts';

const Login = () => {
  const { user, loading, loginAction } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const form = useForm<LoginData>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: isEmail(t('common:login.fields.email.validationMessage')),
      password: hasLength(
        { min: 7 },
        t('common:login.fields.password.validationMessage'),
      ),
    },
  });

  const handleSubmit = async (formData: LoginData) => {
    setSubmitting(true);
    const loginResult = await loginAction(formData);

    if (loginResult) {
      switch (loginResult) {
        case 'INVALID_CREDENTIALS':
          setLoginError(t('common:login.error.invalidCredentials'));
          break;
        case 'UNKNOWN_ERROR':
          setLoginError(t('common:login.error.unknown'));
          break;
        default:
          assertNever(loginResult);
      }
    } else {
      setLoginError(null);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <CenterLoader />;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return (
    <Layout>
      <Flex align="center" h={{ base: '40vh', md: '80vh' }} justify="center">
        <Paper
          p="lg"
          w={{ base: '100%', md: '40rem', lg: '50rem' }}
          withBorder={!isMobile}
        >
          <Text fw={500} pb="md" size="lg">
            {t('common:login.heading')}
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                {...form.getInputProps('email')}
                required
                type="email"
                autoComplete={'username'}
                disabled={submitting}
                label={t('common:login.fields.email.label')}
                placeholder={t('common:login.fields.email.placeholder')}
                radius="md"
              />

              <PasswordInput
                {...form.getInputProps('password')}
                required
                autoComplete={'current-password'}
                disabled={submitting}
                label={t('common:login.fields.password.label')}
                placeholder={t('common:login.fields.password.placeholder')}
                radius="md"
              />
            </Stack>

            {loginError && (
              <Text c="red" mt="md">
                {loginError}
              </Text>
            )}

            <Group justify="space-between" mt="xl">
              <Button
                disabled={submitting}
                loading={submitting}
                radius="xl"
                type="submit"
              >
                {upperFirst(t('common:login.submit'))}
              </Button>
            </Group>
          </form>
        </Paper>
      </Flex>
    </Layout>
  );
};

export default Login;
