import { PencilIcon } from '@heroicons/react/16/solid';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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
  const { fetchAllTables } = useTables();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editedTeamName, setEditedTeamName] = useState<string>('');
  const [editedPlayerName, setEditedPlayerName] = useState<string>('');

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
  const showTableAssignments =
    game.status === GameStatusEnum.InProgress ||
    game.status === GameStatusEnum.Completed;

  // Fetch all tables when in progress or completed
  useEffect(() => {
    if (showTableAssignments) {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game.id, game.numberOfRounds, showTableAssignments, fetchAllTables]);

  // Compute player table assignments from Redux state using useMemo
  const playerTableAssignments = useMemo(() => {
    const assignments: Record<
      number,
      { roundNumber: number; tableNumber: number }[]
    > = {};

    if (!showTableAssignments) {
      return assignments;
    }

    for (const table of allTables) {
      const players = table.players;
      if (!players) continue;
      for (const playerId of players) {
        const id = playerId.id;
        assignments[id] ??= [];
        assignments[id].push({
          roundNumber: table.roundID,
          tableNumber: table.tableNumber,
        });
      }
    }

    return assignments;
  }, [allTables, showTableAssignments]);

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

  const handleStartEditTeam = (teamId: number, currentName: string) => {
    setEditingTeam(teamId);
    setEditedTeamName(currentName);
  };

  const handleSaveTeamName = (teamId: number) => {
    if (editedTeamName.trim()) {
      updateTeam(teamId, editedTeamName.trim());
    }
    setEditingTeam(null);
    setEditedTeamName('');
  };

  const handleDeleteTeam = (teamId: number) => {
    if (globalThis.confirm(t('pages.gameDetail.teams.confirmDeleteTeam'))) {
      deleteTeam(teamId);
    }
  };

  const handleStartEditPlayer = (playerId: number, currentName: string) => {
    setEditingPlayer(playerId);
    setEditedPlayerName(currentName);
  };

  const handleSavePlayerName = (playerId: number) => {
    if (editedPlayerName.trim()) {
      updatePlayer(playerId, editedPlayerName.trim());
    }
    setEditingPlayer(null);
    setEditedPlayerName('');
  };

  return (
    <Stack gap="md">
      {canAddDelete ? (
        <Button
          leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setIsTeamFormOpen(true)}
        >
          {t('pages.gameDetail.teams.addTeam')}
        </Button>
      ) : (
        <Tooltip label={t('pages.gameDetail.teams.cannotAddTeamsAfterStart')}>
          <Button
            disabled
            leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
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
                {/* Team Name */}
                <Group align="center" justify="space-between">
                  {editingTeam === team.id ? (
                    <Group style={{ flex: 1 }}>
                      <TextInput
                        style={{ flex: 1 }}
                        value={editedTeamName}
                        onBlur={() => handleSaveTeamName(team.id)}
                        onChange={(e) =>
                          setEditedTeamName(e.currentTarget.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTeamName(team.id);
                          } else if (e.key === 'Escape') {
                            setEditingTeam(null);
                            setEditedTeamName('');
                          }
                        }}
                      />
                    </Group>
                  ) : (
                    <Title order={3}>{team.name}</Title>
                  )}
                  {!isCompleted && (
                    <Group gap="xs">
                      {canEdit && (
                        <ActionIcon
                          variant="subtle"
                          onClick={() =>
                            handleStartEditTeam(team.id, team.name)
                          }
                        >
                          <PencilIcon style={{ width: 16, height: 16 }} />
                        </ActionIcon>
                      )}
                      {canAddDelete && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <TrashIcon style={{ width: 16, height: 16 }} />
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
                        {editingPlayer === player.id ? (
                          <TextInput
                            size="sm"
                            style={{ flex: 1 }}
                            value={editedPlayerName}
                            onBlur={() => handleSavePlayerName(player.id)}
                            onChange={(e) =>
                              setEditedPlayerName(e.currentTarget.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSavePlayerName(player.id);
                              } else if (e.key === 'Escape') {
                                setEditingPlayer(null);
                                setEditedPlayerName('');
                              }
                            }}
                          />
                        ) : (
                          <>
                            <Stack gap="4px" style={{ flex: 1 }}>
                              <Text size="sm">{player.name}</Text>
                              {showTableAssignments &&
                                (playerTableAssignments[player.id]?.length ??
                                  0) > 0 && (
                                  <Group gap="4px" wrap="wrap">
                                    {(playerTableAssignments[player.id] ?? [])
                                      .slice()
                                      .sort(
                                        (a, b) => a.roundNumber - b.roundNumber,
                                      )
                                      .map((assignment) => (
                                        <Badge
                                          key={`${assignment.roundNumber}-${assignment.tableNumber}`}
                                          color="blue"
                                          size="sm"
                                          variant="light"
                                        >
                                          {t(
                                            'pages.gameDetail.teams.roundShort',
                                          )}
                                          {assignment.roundNumber}:
                                          {t(
                                            'pages.gameDetail.teams.tableShort',
                                          )}
                                          {assignment.tableNumber + 1}
                                        </Badge>
                                      ))}
                                  </Group>
                                )}
                            </Stack>
                            {!isCompleted && (
                              <Group gap="xs">
                                {canEdit && (
                                  <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    onClick={() =>
                                      handleStartEditPlayer(
                                        player.id,
                                        player.name,
                                      )
                                    }
                                  >
                                    <PencilIcon
                                      style={{ width: 12, height: 12 }}
                                    />
                                  </ActionIcon>
                                )}
                              </Group>
                            )}
                          </>
                        )}
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
    </Stack>
  );
};

export default TeamsPanel;
