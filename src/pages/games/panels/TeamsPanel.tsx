import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import usePlayers from '../../../slices/players/hooks';
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
  const { updatePlayer, deletePlayer } = usePlayers();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editedTeamName, setEditedTeamName] = useState<string>('');
  const [editedPlayerName, setEditedPlayerName] = useState<string>('');

  // Get teams and players for this game from Redux
  const teamsEntities = useSelector((state: RootState) => state.teams.entities);
  const allPlayers = useSelector((state: RootState) => state.players.entities);

  // Memoize teams array to prevent unnecessary rerenders
  const teams = useMemo(
    () =>
      game.teams
        .map((teamId) => teamsEntities[teamId])
        .filter((team) => team !== undefined),
    [game.teams, teamsEntities],
  );

  // Helper to get players for a team
  const getPlayersForTeam = (teamId: number) => {
    const team = teams.find((t) => t?.id === teamId);
    if (!team) return [];
    return team.players
      .map((playerId) => allPlayers[playerId])
      .filter((player) => player !== undefined);
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
    if (window.confirm(t('pages.gameDetail.teams.confirmDeleteTeam'))) {
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

  const handleDeletePlayer = (playerId: number) => {
    if (window.confirm(t('pages.gameDetail.teams.confirmDeletePlayer'))) {
      deletePlayer(playerId);
    }
  };

  const isGameActive = game.status === 'active';
  const isSetupMode = !isGameActive;

  return (
    <Stack gap="md">
      {/* Add Team Button */}
      {!isGameActive && (
        <Button
          leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setIsTeamFormOpen(true)}
        >
          {t('pages.gameDetail.teams.addTeam')}
        </Button>
      )}

      {/* Info message when game not started */}
      {!isGameActive && teams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('pages.gameDetail.teams.noTeams')}
        </Text>
      )}

      {/* Teams List */}
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
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleStartEditTeam(team.id, team.name)}
                    >
                      ✏️
                    </ActionIcon>
                    {isSetupMode && (
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <TrashIcon style={{ width: 16, height: 16 }} />
                      </ActionIcon>
                    )}
                  </Group>
                </Group>

                {/* Players */}
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    {t('pages.gameDetail.teams.players')}:
                  </Text>
                  {players.map((player) => {
                    if (!player) return null;
                    return (
                      <Group key={player.id} gap="xs" justify="space-between">
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
                            <Text size="sm">{player.name}</Text>
                            <Group gap="xs">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() =>
                                  handleStartEditPlayer(player.id, player.name)
                                }
                              >
                                ✏️
                              </ActionIcon>
                              {isSetupMode && (
                                <ActionIcon
                                  color="red"
                                  size="sm"
                                  variant="subtle"
                                  onClick={() => handleDeletePlayer(player.id)}
                                >
                                  <TrashIcon
                                    style={{ width: 12, height: 12 }}
                                  />
                                </ActionIcon>
                              )}
                            </Group>
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

      {/* Team Form Modal */}
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
