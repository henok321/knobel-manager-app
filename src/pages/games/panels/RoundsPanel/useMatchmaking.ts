import {
  useResetGameSetupMutation,
  useSetupGameMutation,
} from '../../../../store/api';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';

export const useMatchmaking = (
  gameId: number,
  setError: (message: string | null) => void,
  fallbackErrorMessage: string,
) => {
  const [setupGame, { isLoading: settingUp }] = useSetupGameMutation();
  const [resetSetup, { isLoading: resetting }] = useResetGameSetupMutation();

  const run = async (mutate: () => Promise<unknown>) => {
    setError(null);

    try {
      await mutate();
    } catch (err) {
      setError(backendErrorMessage(err) ?? fallbackErrorMessage);
    }
  };

  return {
    settingUp,
    resetting,
    startMatchmaking: () => void run(() => setupGame({ gameId }).unwrap()),
    resetMatchmaking: () => void run(() => resetSetup({ gameId }).unwrap()),
  };
};
