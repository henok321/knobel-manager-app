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
import { backendErrorMessage, httpStatus } from '../../../../utils/apiError.ts';
import { notifyError } from '../../../../utils/notifyError';
import { type PlayerName, teamChanges } from './teamChanges.ts';

interface TeamMutationHandlers {
  onTeamCreated: (teamName: string) => void;
  confirmSetupReset: (onConfirm: () => void) => void;
}

export const useTeamMutations = (
  game: Game,
  { onTeamCreated, confirmSetupReset }: TeamMutationHandlers,
) => {
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [resetSetup, { isLoading: isResetting }] = useResetGameSetupMutation();
  const dispatch = useDispatch();

  const resetThen = async (afterReset: () => Promise<void>) => {
    try {
      await resetSetup({ gameId: game.id }).unwrap();
      await afterReset();
    } catch (error) {
      notifyError(backendErrorMessage(error));
    }
  };

  // A 409 means either "tables are assigned" or "the game already started",
  // and a stale panel cannot tell them apart - so refetch the game and let the
  // reset itself report which one it was.
  const reportMutationError = (
    error: unknown,
    retry: (() => Promise<void>) | null,
  ) => {
    const conflict = httpStatus(error) === 409;

    if (conflict) {
      dispatch(api.util.invalidateTags([{ type: 'Game', id: game.id }]));
    }

    if (conflict && retry) {
      confirmSetupReset(() => void resetThen(retry));
      return;
    }

    notifyError(backendErrorMessage(error));
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

    onTeamCreated(teamsRequest.name);
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

  return {
    isSubmitting: isCreatingTeam || isResetting,
    removeTeam,
    saveTeam,
    submitTeam,
  };
};
