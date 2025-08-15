import {
  Button,
  Flex,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { LoginData } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import CenterLoader from '../components/CenterLoader';
import Layout from '../components/Layout';

const Login = (props: PaperProps) => {
  const { user, loading, loginAction } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const { t } = useTranslation();

  const form = useForm<LoginData>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val)
          ? null
          : t('pages.login.fields.email.validationMessage'),
      password: (val) =>
        val.length <= 6
          ? t('pages.login.fields.password.validationMessage')
          : null,
    },
  });

  const handleSubmit = async (formData: LoginData) => {
    const loginResult = await loginAction(formData);

    if (loginResult) {
      if (loginResult.code === 'INVALID_CREDENDIAL') {
        setLoginError(t('pages.login.error.invalidCredentials'));
      } else {
        setLoginError(t('pages.login.error.unknown'));
      }
    } else {
      setLoginError(null);
    }
  };

  if (loading) {
    return <CenterLoader />;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return (
    <Layout navbarActive={false}>
      <Flex align="center" h="80vh" justify="center">
        <Paper
          withBorder
          p="lg"
          radius="md"
          w={{ base: 320, sm: 400, md: 480, lg: 540, xl: 600 }}
          {...props}
        >
          <Text fw={500} pb="md" size="lg">
            {t('pages.login.heading')}
          </Text>

          <form
            onSubmit={form.onSubmit((formData) => {
              handleSubmit(formData);
            })}
          >
            <Stack>
              <TextInput
                required
                error={form.errors.email && 'Invalid email'}
                label="Email"
                placeholder={t('pages.login.fields.email.placeholder')}
                radius="md"
                value={form.values.email}
                onChange={(event) =>
                  form.setFieldValue('email', event.currentTarget.value)
                }
              />

              <PasswordInput
                required
                error={
                  form.errors.password &&
                  t('pages.login.fields.password.validationMessage')
                }
                label={t('pages.login.fields.password.label')}
                placeholder={t('pages.login.fields.password.placeholder')}
                radius="md"
                value={form.values.password}
                onChange={(event) =>
                  form.setFieldValue('password', event.currentTarget.value)
                }
              />
            </Stack>

            {loginError && (
              <Text c="red" mt="md">
                {loginError}
              </Text>
            )}

            <Group justify="space-between" mt="xl">
              <Button radius="xl" type="submit">
                {upperFirst(t('pages.login.submit'))}
              </Button>
            </Group>
          </form>
        </Paper>
      </Flex>
    </Layout>
  );
};

export default Login;
