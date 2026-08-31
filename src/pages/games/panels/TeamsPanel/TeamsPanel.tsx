import { Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  api,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useGetGameTablesQuery,
  useResetGameSetupMutation,
  useUpdatePlayerMutation,
  useUpdateTeamMutation,
} from '../../../../store/api';
import type { Game, TeamsRequest } from '../../../../store/api.gen.ts';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';
import { isConflictError } from '../../../../utils/isConflictError.ts';
import { notifyError } from '../../../../utils/notifyError';
import EditTeamDialog from './EditTeamDialog';
import TeamCard from './TeamCard';
import TeamForm from './TeamForm';
import { type PlayerName, teamChanges } from './teamChanges.ts';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation();
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [resetSetup, { isLoading: isResetting }] = useResetGameSetupMutation();
  const dispatch = useDispatch();
  const { data: tablesData } = useGetGameTablesQuery({ gameId: game.id });
  const tables = tablesData?.tables ?? [];
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const allTeams = game.teams ?? [];
  const query = searchQuery.trim().toLowerCase();
  const teams = query
    ? allTeams.filter((team) => team.name.toLowerCase().includes(query))
    : allTeams;

  const roundNumberByRoundId = new Map(
    (game.rounds ?? []).map((r) => [r.id, r.roundNumber]),
  );

  const editingTeam = allTeams.find((team) => team.id === editingTeamId);

  const canAddDelete = game.status === 'setup';
  const canEdit = game.status !== 'completed';

  const showTableAssignments = tables.length > 0;

  const playerTableAssignments: Record<
    number,
    { roundNumber: number; tableNumber: number }[]
  > = {};

  for (const table of tables) {
    const tablePlayers = table.players;
    if (!tablePlayers) {
      continue;
    }
    const tableRoundNumber =
      roundNumberByRoundId.get(table.roundID) ?? table.roundID;
    for (const player of tablePlayers) {
      const id = player.id;
      playerTableAssignments[id] ??= [];
      playerTableAssignments[id].push({
        roundNumber: tableRoundNumber,
        tableNumber: table.tableNumber,
      });
    }
  }

  const closeTeamForm = () => setIsTeamFormOpen(false);

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
    closeTeamForm();
  };

  const handleStartEditTeam = (teamID: number) => {
    setEditingTeamId(teamID);
  };

  const handleSaveTeam = async (teamName: string, players: PlayerName[]) => {
    if (!editingTeam) {
      return;
    }
    const { nameChanged, renamedPlayers } = teamChanges(
      editingTeam,
      teamName,
      players,
    );

    await Promise.all([
      ...(nameChanged
        ? [
            updateTeam({
              gameId: game.id,
              teamId: editingTeam.id,
              teamsRequest: { name: teamName },
            }).unwrap(),
          ]
        : []),
      ...renamedPlayers.map((player) =>
        updatePlayer({
          gameId: game.id,
          teamId: editingTeam.id,
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

  const handleDeleteTeam = (teamID: number) => {
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

  return (
    <Stack gap="md">
      <Group align="flex-end" justify="space-between" wrap="wrap">
        <TextInput
          placeholder={t('gameDetail:teams.searchTeams')}
          style={{ width: 250 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        {canAddDelete ? (
          <Button
            leftSection={<IconPlus size={20} stroke={1.5} />}
            style={{ alignSelf: 'flex-start' }}
            onClick={() => setIsTeamFormOpen(true)}
          >
            {t('gameDetail:teams.addTeam')}
          </Button>
        ) : (
          <Tooltip label={t('gameDetail:teams.cannotAddTeamsAfterStart')}>
            <Button
              disabled
              leftSection={<IconPlus size={20} stroke={1.5} />}
              style={{ alignSelf: 'flex-start' }}
            >
              {t('gameDetail:teams.addTeam')}
            </Button>
          </Tooltip>
        )}
      </Group>

      {canAddDelete && allTeams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('gameDetail:teams.noTeams')}
        </Text>
      )}

      {allTeams.length > 0 && teams.length === 0 && searchQuery.trim() && (
        <Text c="dimmed" ta="center">
          {t('gameDetail:teams.noSearchResults')}
        </Text>
      )}

      <Stack gap="md">
        {teams.map((team) => {
          return (
            <TeamCard
              key={team.id}
              canAddDelete={canAddDelete}
              canEdit={canEdit}
              numberOfRounds={game.numberOfRounds}
              playerTableAssignments={playerTableAssignments}
              showTableAssignments={showTableAssignments}
              team={team}
              onDelete={handleDeleteTeam}
              onEdit={handleStartEditTeam}
            />
          );
        })}
      </Stack>

      {isTeamFormOpen && (
        <TeamForm
          createTeam={(teamsRequest) => void submitTeam(teamsRequest)}
          isSubmitting={isCreatingTeam || isResetting}
          teamSize={game.teamSize}
          onClose={closeTeamForm}
        />
      )}

      {editingTeam && (
        <EditTeamDialog
          players={editingTeam.players ?? []}
          teamName={editingTeam.name}
          onClose={() => setEditingTeamId(null)}
          onSave={handleSaveTeam}
        />
      )}
    </Stack>
  );
};

export default TeamsPanel;
