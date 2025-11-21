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

import EditTeamDialog from '../../../components/EditTeamDialog';
import { Game, GameStatusEnum, Player } from '../../../generated';
import useGames from '../../../slices/games/hooks';
import TeamForm, { TeamFormData } from '../../home/TeamForm';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { createTeam, updateTeam, deleteTeam, updatePlayer, fetchAllTables } =
    useGames();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const canAddDelete = game.status === GameStatusEnum.Setup;
  const canEdit =
    game.status === GameStatusEnum.Setup ||
    game.status === GameStatusEnum.InProgress;
  const isCompleted = game.status === GameStatusEnum.Completed;

  const teams = game.teams || [];
  const rounds = useMemo(() => game.rounds || [], [game.rounds]);
  const roundsCount = rounds.length;

  useEffect(() => {
    if (roundsCount > 0) {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game.id, game.numberOfRounds, roundsCount, fetchAllTables]);

  const allTables = useMemo(
    () =>
      rounds
        .flatMap((round) => round.tables || [])
        .filter((table) => table !== undefined),
    [rounds],
  );

  const showTableAssignments = allTables.length > 0;

  const playerTableAssignments = useMemo(() => {
    const assignments: Record<
      number,
      { roundNumber: number; tableNumber: number }[]
    > = {};

    for (const round of rounds) {
      if (!round.tables) continue;
      for (const table of round.tables) {
        const players = table.players;
        if (!players) continue;
        for (const player of players) {
          const id = player.id;
          assignments[id] ??= [];
          assignments[id].push({
            roundNumber: round.roundNumber,
            tableNumber: table.tableNumber,
          });
        }
      }
    }

    return assignments;
  }, [rounds]);

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
      updateTeam(game.id, editingTeamId, teamName);

      // Update all player names
      const team = teams.find((t) => t.id === editingTeamId);
      if (team) {
        players.forEach((player) => {
          updatePlayer(game.id, team.id, player.id, player.name);
        });
      }
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
        deleteTeam(game.id, teamId);
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

      {canAddDelete && teams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('teams.noTeams')}
        </Text>
      )}

      <Stack gap="md">
        {teams.map((team) => {
          const players = team.players || [];

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
                  {players.map((player) => (
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
                  ))}
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
          players={
            (teams.find((t) => t.id === editingTeamId)?.players ||
              []) as Player[]
          }
          teamName={teams.find((t) => t.id === editingTeamId)?.name || ''}
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
