import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useUpdateTeamMutation,
  useUpdatePlayerMutation,
  useGetAllTablesForGameQuery,
} from '../../../api/rtkQueryApi';
import EditTeamDialog from '../../../components/EditTeamDialog';
import { GameStatusEnum } from '../../../generated';
import usePlayers from '../../../hooks/usePlayers';
import useTeams from '../../../hooks/useTeams';
import { Game } from '../../../types';
import TeamForm, { TeamFormData } from '../../home/TeamForm';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { allTeams } = useTeams(); // Still use for selectors
  const { allPlayers } = usePlayers(); // Still use for selectors

  // RTK Query mutations
  const [createTeamMutation] = useCreateTeamMutation();
  const [updateTeamMutation] = useUpdateTeamMutation();
  const [deleteTeamMutation] = useDeleteTeamMutation();
  const [updatePlayerMutation] = useUpdatePlayerMutation();

  // RTK Query for tables
  const { data: allTables = [] } = useGetAllTablesForGameQuery(
    { gameId: game.id, numberOfRounds: game.numberOfRounds },
    { skip: !game.rounds || game.rounds.length === 0 },
  );

  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const canAddDelete = game.status === GameStatusEnum.Setup;
  const canEdit =
    game.status === GameStatusEnum.Setup ||
    game.status === GameStatusEnum.InProgress;
  const isCompleted = game.status === GameStatusEnum.Completed;

  const showTableAssignments = allTables.length > 0;

  const playerTableAssignments = useMemo(() => {
    const assignments: Record<
      number,
      { roundNumber: number; tableNumber: number }[]
    > = {};

    for (const table of allTables) {
      const players = table.players;
      if (!players) continue;
      const tableRoundNumber =
        (table as typeof table & { roundNumber?: number }).roundNumber ||
        table.roundID;
      for (const playerId of players) {
        const id = playerId.id;
        assignments[id] ??= [];
        assignments[id].push({
          roundNumber: tableRoundNumber,
          tableNumber: table.tableNumber,
        });
      }
    }

    return assignments;
  }, [allTables]);

  const getPlayersForTeam = (teamId: number) => {
    const team = allTeams.find((t) => t?.id === teamId);
    if (!team) return [];
    return team.players
      .map((playerId) => allPlayers.find((p) => p.id === playerId))
      .filter(
        (player): player is NonNullable<typeof player> => player !== undefined,
      );
  };

  const handleCreateTeam = async (teamData: TeamFormData) => {
    const teamsRequest = {
      name: teamData.name,
      players: teamData.members.map((name) => ({ name })),
    };
    try {
      await createTeamMutation({
        gameId: game.id,
        teamRequest: teamsRequest,
      }).unwrap();
      setIsTeamFormOpen(false);
    } catch {
      // Error is handled by RTK Query
    }
  };

  const handleStartEditTeam = (teamId: number) => {
    setEditingTeamId(teamId);
    setEditTeamDialogOpen(true);
  };

  const handleSaveTeam = async (
    teamName: string,
    players: { id: number; name: string }[],
  ) => {
    if (editingTeamId) {
      const team = allTeams.find((t) => t.id === editingTeamId);
      if (!team) return;

      try {
        // Update team name
        await updateTeamMutation({
          gameId: game.id,
          teamId: editingTeamId,
          name: teamName,
        }).unwrap();

        // Update all player names
        await Promise.all(
          players.map((player) =>
            updatePlayerMutation({
              gameId: game.id,
              teamId: team.id,
              playerId: player.id,
              name: player.name,
            }).unwrap(),
          ),
        );

        setEditTeamDialogOpen(false);
        setEditingTeamId(null);
      } catch {
        // Error is handled by RTK Query
      }
    }
  };

  const handleDeleteTeam = (teamId: number) => {
    modals.openConfirmModal({
      title: t('teams.deleteTeam'),
      children: <Text size="sm">{t('teams.confirmDeleteTeam')}</Text>,
      labels: {
        confirm: t('actions.delete'),
        cancel: t('actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteTeamMutation({
            gameId: game.id,
            teamId,
          }).unwrap();
        } catch {
          // Error is handled by RTK Query
        }
      },
    });
  };

  return (
    <Stack gap="md">
      {canAddDelete ? (
        <Button
          leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setIsTeamFormOpen(true)}
        >
          {t('teams.addTeam')}
        </Button>
      ) : (
        <Tooltip label={t('teams.cannotAddTeamsAfterStart')}>
          <Button
            disabled
            leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('teams.addTeam')}
          </Button>
        </Tooltip>
      )}

      {canAddDelete && allTeams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('teams.noTeams')}
        </Text>
      )}

      <Stack gap="md">
        {allTeams.map((team) => {
          if (!team) return null;
          const players = getPlayersForTeam(team.id);

          return (
            <Card key={team.id} withBorder padding="lg" radius="md" shadow="sm">
              <Stack gap="md">
                {/* Team Name with Edit/Delete Actions */}
                <Group align="center" justify="space-between">
                  <Title order={3}>{team.name}</Title>
                  {!isCompleted && (
                    <Group gap="xs">
                      {canEdit && (
                        <ActionIcon
                          variant="subtle"
                          onClick={() => handleStartEditTeam(team.id)}
                        >
                          <IconPencil style={{ width: 16, height: 16 }} />
                        </ActionIcon>
                      )}
                      {canAddDelete && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <IconTrash style={{ width: 16, height: 16 }} />
                        </ActionIcon>
                      )}
                    </Group>
                  )}
                </Group>

                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    {t('teams.players')}:
                  </Text>
                  {players.map((player) => {
                    if (!player) return null;
                    return (
                      <Group
                        key={player.id}
                        align="flex-start"
                        gap="xs"
                        justify="space-between"
                        wrap="wrap"
                      >
                        <Stack gap="4px" style={{ flex: 1 }}>
                          <Text size="sm">{player.name}</Text>
                          {showTableAssignments &&
                            (playerTableAssignments[player.id]?.length ?? 0) >
                              0 && (
                              <Group gap="4px" wrap="wrap">
                                {(playerTableAssignments[player.id] ?? [])
                                  .slice()
                                  .sort((a, b) => a.roundNumber - b.roundNumber)
                                  .map((assignment) => (
                                    <Badge
                                      key={`${assignment.roundNumber}-${assignment.tableNumber}`}
                                      color="blue"
                                      size="sm"
                                      variant="light"
                                    >
                                      {t('teams.roundShort')}
                                      {assignment.roundNumber}:
                                      {t('teams.tableShort')}
                                      {assignment.tableNumber}
                                    </Badge>
                                  ))}
                              </Group>
                            )}
                        </Stack>
                      </Group>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <TeamForm
        createTeam={handleCreateTeam}
        isOpen={isTeamFormOpen}
        teamSize={game.teamSize}
        onClose={() => setIsTeamFormOpen(false)}
      />

      {editingTeamId && (
        <EditTeamDialog
          isOpen={editTeamDialogOpen}
          players={getPlayersForTeam(editingTeamId)}
          teamName={allTeams.find((t) => t?.id === editingTeamId)?.name || ''}
          onClose={() => {
            setEditTeamDialogOpen(false);
            setEditingTeamId(null);
          }}
          onSave={handleSaveTeam}
        />
      )}
    </Stack>
  );
};

export default TeamsPanel;
