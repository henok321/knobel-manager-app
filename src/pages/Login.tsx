import {
  Button,
  Container,
  Flex,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { LoginData } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import CenterLoader from '../shared/CenterLoader';
import Layout from '../shared/layout/Layout.tsx';

const Login = (props: PaperProps) => {
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
      email: (val) =>
        /^\S+@\S+$/.test(val)
          ? null
          : t('login.fields.email.validationMessage'),
      password: (val) =>
        val.length <= 6 ? t('login.fields.password.validationMessage') : null,
    },
  });

  const handleSubmit = async (formData: LoginData) => {
    setSubmitting(true);
    const loginResult = await loginAction(formData);

    if (loginResult) {
      if (loginResult.code === 'INVALID_CREDENTIALS') {
        setLoginError(t('login.error.invalidCredentials'));
      } else {
        setLoginError(t('login.error.unknown'));
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

  const renderLoginForm = () => (
    <>
      <Text fw={500} pb="md" size="lg">
        {t('login.heading')}
      </Text>

      <form
        onSubmit={form.onSubmit(async (formData) => {
          await handleSubmit(formData);
        })}
      >
        <Stack>
          <TextInput
            required
            disabled={submitting}
            error={
              form.errors.email && t('login.fields.email.validationMessage')
            }
            label={t('login.fields.email.label')}
            placeholder={t('login.fields.email.placeholder')}
            radius="md"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue('email', event.currentTarget.value)
            }
          />

          <PasswordInput
            required
            disabled={submitting}
            error={
              form.errors.password &&
              t('login.fields.password.validationMessage')
            }
            label={t('login.fields.password.label')}
            placeholder={t('login.fields.password.placeholder')}
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
          <Button
            disabled={submitting}
            loading={submitting}
            radius="xl"
            type="submit"
          >
            {upperFirst(t('login.submit'))}
          </Button>
        </Group>
      </form>
    </>
  );

  return (
    <Layout navbarActive={false}>
      {isMobile ? (
        <Flex align="center" h="40vh" justify="center">
          <Container size="md" style={{ width: theme.breakpoints.md }}>
            {renderLoginForm()}
          </Container>
        </Flex>
      ) : (
        <Flex align="center" h="80vh" justify="center">
          <Paper
            withBorder
            p="lg"
            radius="md"
            w={{ md: '40rem', lg: '50rem' }}
            {...props}
          >
            {renderLoginForm()}
          </Paper>{' '}
        </Flex>
      )}
    </Layout>
  );
};

export default Login;
