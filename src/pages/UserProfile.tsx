import { ChangeEvent, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading, Input, Stack } from '@chakra-ui/react';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import Layout from '../components/Layout.tsx';
import { Alert } from '../components/ui/alert.tsx';
import { Field } from '../components/ui/field.tsx';

const UserProfile = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const user = auth.currentUser;
    if (user) {
      try {
        if (formData.displayName) {
          await updateProfile(user, { displayName: formData.displayName });
        }
        if (formData.email) {
          await updateEmail(user, formData.email);
        }
        if (formData.password) {
          await updatePassword(user, formData.password);
        }
        setSuccess(t('PROFILE_UPDATE_SUCCESS'));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }
  };

  return (
    <Layout>
      <Stack gap={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>{t('USER_PROFILE_HEADING')}</Heading>
        </Stack>
        <Box rounded={'lg'} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Field id="displayName" label={t('USER_PROFILE_DISPLAY_NAME')}>
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                />
              </Field>
              <Field id="email" label={t('USER_PROFILE_EMAIL')}>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field id="password" label={t('USER_PROFILE_PASSWORD')}>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Field>
              <Stack gap={10}>
                <Button
                  type="submit"
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  {t('UPDATE_PROFILE_SUBMIT')}
                </Button>
                {error && <Alert status="error">{error}</Alert>}
                {success && <Alert status="success">{success}</Alert>}
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Layout>
  );
};

export default UserProfile;
