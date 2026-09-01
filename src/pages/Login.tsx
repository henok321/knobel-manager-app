import {
  Button,
  Flex,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { useAuth } from '../auth/useAuth';
import CenterLoader from '../shared/CenterLoader';
import Layout from '../shared/layout/Layout.tsx';
import { assertNever } from '../utils/assertNever.ts';

const PASSWORD_MIN_LENGTH = 7;

const Login = () => {
  const { user, loading, loginAction } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);

    const loginResult = await loginAction({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    switch (loginResult) {
      case null:
        setLoginError(null);
        break;
      case 'INVALID_CREDENTIALS':
        setLoginError(t('common:login.error.invalidCredentials'));
        break;
      case 'UNKNOWN_ERROR':
        setLoginError(t('common:login.error.unknown'));
        break;
      default:
        assertNever(loginResult);
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
        <Paper withBorder p="lg" w={{ base: '100%', md: '40rem', lg: '50rem' }}>
          <Text fw={500} pb="md" size="lg">
            {t('common:login.heading')}
          </Text>

          <form onSubmit={(event) => void submit(event)}>
            <Stack>
              <TextInput
                required
                autoComplete="username"
                disabled={submitting}
                label={t('common:login.fields.email.label')}
                name="email"
                placeholder={t('common:login.fields.email.placeholder')}
                radius="md"
                type="email"
              />

              <PasswordInput
                required
                autoComplete="current-password"
                disabled={submitting}
                label={t('common:login.fields.password.label')}
                minLength={PASSWORD_MIN_LENGTH}
                name="password"
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
                {t('common:login.submit')}
              </Button>
            </Group>
          </form>
        </Paper>
      </Flex>
    </Layout>
  );
};

export default Login;
