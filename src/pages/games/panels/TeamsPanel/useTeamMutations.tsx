import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  api,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useResetGameSetupMutation,
  useUpdatePlayerMutation,
  useUpdateTeamMutation,
} from '../../../../store/api';
import type { Game, Team, TeamsRequest } from '../../../../store/api.gen.ts';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';
import { isConflictError } from '../../../../utils/isConflictError.ts';
import { notifyError } from '../../../../utils/notifyError';
import { type PlayerName, teamChanges } from './teamChanges.ts';

export const useTeamMutations = (game: Game, onTeamCreated: () => void) => {
  const { t } = useTranslation();
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [resetSetup, { isLoading: isResetting }] = useResetGameSetupMutation();
  const dispatch = useDispatch();

  const resetThen = async (afterReset: () => void | Promise<void>) => {
    try {
      await resetSetup({ gameId: game.id }).unwrap();
      await afterReset();
    } catch (error) {
      notifyError(backendErrorMessage(error));
    }
  };

  const offerSetupReset = (afterReset: () => void | Promise<void>) =>
    modals.openConfirmModal({
      modalId: 'reset-matchmaking',
      title: t('gameDetail:rounds.resetMatchmaking'),
      children: (
        <Text size="sm">{t('gameDetail:teams.resetToChangeTeams')}</Text>
      ),
      labels: {
        confirm: t('gameDetail:rounds.resetMatchmaking'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => void resetThen(afterReset),
    });

  // A 409 means either "tables are assigned" or "the game already started",
  // and a stale panel cannot tell them apart - so refetch the game and let the
  // reset itself report which one it was.
  const reportMutationError = (
    error: unknown,
    retry: (() => Promise<void>) | null,
  ) => {
    if (!isConflictError(error)) {
      notifyError(backendErrorMessage(error));
      return;
    }

    dispatch(api.util.invalidateTags([{ type: 'Game', id: game.id }]));

    if (!retry) {
      notifyError(backendErrorMessage(error));
      return;
    }

    offerSetupReset(retry);
  };

  const submitTeam = async (teamsRequest: TeamsRequest, mayReset = true) => {
    try {
      await createTeam({ gameId: game.id, teamsRequest }).unwrap();
    } catch (error) {
      reportMutationError(
        error,
        mayReset ? () => submitTeam(teamsRequest, false) : null,
      );

      return;
    }

    notifications.show({
      title: t('common:actions.success'),
      message: t('games:card.teamAdded', { name: teamsRequest.name }),
      color: 'green',
    });
    onTeamCreated();
  };

  const saveTeam = async (
    team: Team,
    teamName: string,
    players: PlayerName[],
  ) => {
    const { nameChanged, renamedPlayers } = teamChanges(
      team,
      teamName,
      players,
    );

    await Promise.all([
      ...(nameChanged
        ? [
            updateTeam({
              gameId: game.id,
              teamId: team.id,
              teamsRequest: { name: teamName },
            }).unwrap(),
          ]
        : []),
      ...renamedPlayers.map((player) =>
        updatePlayer({
          gameId: game.id,
          teamId: team.id,
          playerId: player.id,
          playersRequest: { name: player.name },
        }).unwrap(),
      ),
    ]);
  };

  const removeTeam = async (teamID: number, mayReset = true) => {
    try {
      await deleteTeam({ gameId: game.id, teamId: teamID }).unwrap();
    } catch (error) {
      reportMutationError(
        error,
        mayReset ? () => removeTeam(teamID, false) : null,
      );
    }
  };

  const confirmDeleteTeam = (teamID: number) => {
    modals.openConfirmModal({
      title: t('gameDetail:teams.deleteTeam'),
      children: (
        <Text size="sm">{t('gameDetail:teams.confirmDeleteTeam')}</Text>
      ),
      labels: {
        confirm: t('common:actions.delete'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => void removeTeam(teamID),
    });
  };

  return {
    confirmDeleteTeam,
    isSubmitting: isCreatingTeam || isResetting,
    saveTeam,
    submitTeam,
  };
};
