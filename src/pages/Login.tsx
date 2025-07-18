import {
  Button,
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
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { LoginData } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import CenterLoader from '../components/CenterLoader';
import Layout from '../components/Layout';

const Login = (props: PaperProps) => {
  const { user, loading, loginAction } = useAuth();

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
    await loginAction(formData);
  };

  if (loading) {
    return <CenterLoader />;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return (
    <Layout center>
      <Paper withBorder p="lg" radius="md" {...props}>
        <Text fw={500} size="lg">
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

          <Group justify="space-between" mt="xl">
            <Button radius="xl" type="submit">
              {upperFirst(t('pages.login.submit'))}
            </Button>
          </Group>
        </form>
      </Paper>
    </Layout>
  );
};

export default Login;
