import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import i18n from 'i18next';
import type { ReactNode } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  color?: string;
  modalId?: string;
  onConfirm: () => void;
}

export const openConfirmDialog = ({
  title,
  message,
  confirmLabel,
  color = 'red',
  modalId,
  onConfirm,
}: ConfirmDialogOptions) =>
  modals.openConfirmModal({
    modalId,
    title,
    children:
      typeof message === 'string' ? <Text size="sm">{message}</Text> : message,
    labels: { confirm: confirmLabel, cancel: i18n.t('common:actions.cancel') },
    confirmProps: { color },
    onConfirm,
  });
