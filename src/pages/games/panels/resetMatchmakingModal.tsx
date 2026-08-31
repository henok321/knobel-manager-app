import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import type { TFunction } from 'i18next';

export const openResetMatchmakingModal = (
  t: TFunction,
  onConfirm: () => unknown,
) =>
  modals.openConfirmModal({
    title: t('gameDetail:rounds.resetMatchmaking'),
    children: (
      <Text size="sm">{t('gameDetail:rounds.confirmResetMatchmaking')}</Text>
    ),
    labels: {
      confirm: t('gameDetail:rounds.resetMatchmaking'),
      cancel: t('common:actions.cancel'),
    },
    confirmProps: { color: 'red' },
    onConfirm,
  });
