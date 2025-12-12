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
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EditTeamDialog from './EditTeamDialog.tsx';
import usePlayers from '../../../slices/players/hooks';
import useTables from '../../../slices/tables/hooks';
import useTeams from '../../../slices/teams/hooks';
import { Game } from '../../../slices/types';
import TeamForm, { TeamFormData } from '../../home/TeamForm';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { allTeams, createTeam, updateTeam, deleteTeam } = useTeams();
  const { allPlayers, updatePlayer } = usePlayers();
  const { tables: allTables, fetchAllTables, status } = useTables();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const canAddDelete = game.status === 'setup';
  const canEdit = game.status === 'setup' || game.status === 'in_progress';
  const isCompleted = game.status === 'completed';

  const roundsCount = game.rounds?.length || 0;

  useEffect(() => {
    if (roundsCount > 0 && status === 'idle') {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game.id, game.numberOfRounds, roundsCount, fetchAllTables, status]);

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

  const handleCreateTeam = (teamData: TeamFormData) => {
    const teamsRequest = {
      name: teamData.name,
      players: teamData.members.map((name) => ({ name })),
    };
    createTeam(game.id, teamsRequest);
    setIsTeamFormOpen(false);
  };

  const handleStartEditTeam = (teamId: number) => {
    setEditingTeamId(teamId);
    setEditTeamDialogOpen(true);
  };

  const handleSaveTeam = (
    teamName: string,
    players: { id: number; name: string }[],
  ) => {
    if (editingTeamId) {
      // Update team name
      updateTeam(editingTeamId, teamName);

      // Update all player names
      players.forEach((player) => {
        updatePlayer(player.id, player.name);
      });
    }
    setEditTeamDialogOpen(false);
    setEditingTeamId(null);
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
      onConfirm: () => {
        deleteTeam(teamId);
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
