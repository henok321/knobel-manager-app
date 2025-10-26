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
import { useSelector } from 'react-redux';

import EditTeamDialog from '../../../components/EditTeamDialog';
import { GameStatusEnum } from '../../../generated';
import usePlayers from '../../../slices/players/hooks';
import useTables from '../../../slices/tables/hooks';
import { tablesSelectors } from '../../../slices/tables/slice';
import useTeams from '../../../slices/teams/hooks';
import { Game } from '../../../slices/types';
import { RootState } from '../../../store/store';
import TeamForm, { TeamFormData } from '../../home/TeamForm';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation();
  const { createTeam, updateTeam, deleteTeam } = useTeams();
  const { updatePlayer } = usePlayers();
  const { fetchAllTables, status } = useTables();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const teamsEntities = useSelector((state: RootState) => state.teams.entities);
  const allPlayers = useSelector((state: RootState) => state.players.entities);
  const allTables = useSelector(tablesSelectors.selectAll);

  const teams = useMemo(
    () =>
      game.teams
        .map((teamId) => teamsEntities[teamId])
        .filter((team) => team !== undefined),
    [game.teams, teamsEntities],
  );

  const canAddDelete = game.status === GameStatusEnum.Setup;
  const canEdit =
    game.status === GameStatusEnum.Setup ||
    game.status === GameStatusEnum.InProgress;
  const isCompleted = game.status === GameStatusEnum.Completed;

  const roundsCount = useMemo(
    () => game.rounds?.length || 0,
    [game.rounds?.length],
  );

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
    const team = teams.find((t) => t?.id === teamId);
    if (!team) return [];
    return team.players
      .map((playerId) => allPlayers[playerId])
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
      title: t('pages.gameDetail.teams.deleteTeam'),
      children: (
        <Text size="sm">{t('pages.gameDetail.teams.confirmDeleteTeam')}</Text>
      ),
      labels: {
        confirm: t('global.delete'),
        cancel: t('global.cancel'),
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
          {t('pages.gameDetail.teams.addTeam')}
        </Button>
      ) : (
        <Tooltip label={t('pages.gameDetail.teams.cannotAddTeamsAfterStart')}>
          <Button
            disabled
            leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('pages.gameDetail.teams.addTeam')}
          </Button>
        </Tooltip>
      )}

      {canAddDelete && teams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('pages.gameDetail.teams.noTeams')}
        </Text>
      )}

      <Stack gap="md">
        {teams.map((team) => {
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
                    {t('pages.gameDetail.teams.players')}:
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
                                      {t('pages.gameDetail.teams.roundShort')}
                                      {assignment.roundNumber}:
                                      {t('pages.gameDetail.teams.tableShort')}
                                      {assignment.tableNumber + 1}
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
          teamName={teams.find((t) => t?.id === editingTeamId)?.name || ''}
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
