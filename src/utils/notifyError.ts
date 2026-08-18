import { notifications } from '@mantine/notifications';
import i18n from 'i18next';

export const notifyError = (message?: string) =>
  notifications.show({
    title: i18n.t('common:actions.error'),
    message: message ?? i18n.t('common:actions.errorOccurred'),
    color: 'red',
  });
