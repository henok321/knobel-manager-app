import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import {
  useResetGameSetupMutation,
  useSetupGameMutation,
} from '../../../../store/api';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';

export const useMatchmaking = (
  gameId: number,
  setError: (message: string | null) => void,
) => {
  const { t } = useTranslation();
  const [setupGame, { isLoading: settingUp }] = useSetupGameMutation();
  const [resetSetup, { isLoading: resetting }] = useResetGameSetupMutation();

  const run = async (mutate: () => Promise<unknown>) => {
    setError(null);

    try {
      await mutate();
    } catch (err) {
      setError(backendErrorMessage(err) ?? t('gameDetail:rounds.error'));
    }
  };

  return {
    settingUp,
    resetting,
    startMatchmaking: () => void run(() => setupGame({ gameId }).unwrap()),
    confirmReset: () =>
      modals.openConfirmModal({
        modalId: 'reset-matchmaking',
        title: t('gameDetail:rounds.resetMatchmaking'),
        children: (
          <Text size="sm">
            {t('gameDetail:rounds.confirmResetMatchmaking')}
          </Text>
        ),
        labels: {
          confirm: t('gameDetail:rounds.resetMatchmaking'),
          cancel: t('common:actions.cancel'),
        },
        confirmProps: { color: 'red' },
        onConfirm: () => void run(() => resetSetup({ gameId }).unwrap()),
      }),
  };
};
