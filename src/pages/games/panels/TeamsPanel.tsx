import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '../../../shared/Icon';
import usePlayers, { usePlayersByGameId } from '../../../slices/players/hooks';
import useTables, { useTablesByGameId } from '../../../slices/tables/hooks';
import useTeams, { useTeamsByGameId } from '../../../slices/teams/hooks';
import type { Game, GameStatus, Player } from '../../../slices/types';
import { assertNever } from '../../../utils/assertNever';
import TeamForm, { type TeamFormData } from '../components/TeamForm';
import EditTeamDialog from './EditTeamDialog.tsx';

interface TeamsPanelProps {
  game: Game;
}

type RoundTableAssignment = { roundNumber: number; tableNumber: number };

interface TeamScheduleMatrixProps {
  players: Player[];
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  numberOfRounds: number;
}

const PLAYER_COL_PERCENT = 32;

const TeamScheduleMatrix = ({
  players,
  playerTableAssignments,
  numberOfRounds,
}: TeamScheduleMatrixProps) => {
  const { t } = useTranslation();
  const rounds = Array.from({ length: numberOfRounds }, (_, i) => i + 1);
  const roundColWidth = `${(100 - PLAYER_COL_PERCENT) / numberOfRounds}%`;

  return (
    <Table
      horizontalSpacing="xs"
      style={{ tableLayout: 'fixed', width: '100%' }}
      verticalSpacing="xs"
      withRowBorders={false}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={`${PLAYER_COL_PERCENT}%`}>
            {t('gameDetail:teams.players')}
          </Table.Th>
          {rounds.map((round) => (
            <Table.Th key={round} ta="center" w={roundColWidth}>
              <Text component="span" fw={600} size="sm" visibleFrom="sm">
                {t('gameDetail:teams.roundColumn', { round })}
              </Text>
              <Text component="span" fw={600} hiddenFrom="sm" size="sm">
                {t('gameDetail:teams.roundColumnShort', { round })}
              </Text>
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {players.map((player) => {
          const tableByRound = new Map<number, number>(
            (playerTableAssignments[player.id] ?? []).map((a) => [
              a.roundNumber,
              a.tableNumber,
            ]),
          );
          return (
            <Table.Tr key={player.id}>
              <Table.Td>
                <Text size="sm" truncate>
                  {player.name}
                </Text>
              </Table.Td>
              {rounds.map((round) => {
                const tableNumber = tableByRound.get(round);
                return (
                  <Table.Td key={round} ta="center">
                    {tableNumber !== undefined && (
                      <Badge color="indigo" size="sm" variant="light">
                        <Text component="span" inherit visibleFrom="sm">
                          {t('gameDetail:teams.tableCell', {
                            table: tableNumber,
                          })}
                        </Text>
                        <Text component="span" hiddenFrom="sm" inherit>
                          {t('gameDetail:teams.tableCellShort', {
                            table: tableNumber,
                          })}
                        </Text>
                      </Badge>
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};

interface TeamCardProps {
  team: { id: number; name: string };
  players: Player[];
  numberOfRounds: number;
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  showTableAssignments: boolean;
  canEdit: boolean;
  canAddDelete: boolean;
  isCompleted: boolean;
  onEdit: (teamID: number) => void;
  onDelete: (teamID: number) => void;
}

const TeamCard = ({
  team,
  players,
  numberOfRounds,
  playerTableAssignments,
  showTableAssignments,
  canEdit,
  canAddDelete,
  isCompleted,
  onEdit,
  onDelete,
}: TeamCardProps) => {
  const { t } = useTranslation();

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group align="center" justify="space-between">
          <Title order={3}>{team.name}</Title>
          {!isCompleted && (
            <Group gap="xs">
              {canEdit && (
                <ActionIcon variant="subtle" onClick={() => onEdit(team.id)}>
                  <Icon icon={IconPencil} size={16} />
                </ActionIcon>
              )}
              {canAddDelete && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => onDelete(team.id)}
                >
                  <Icon icon={IconTrash} size={16} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Group>

        {showTableAssignments ? (
          <TeamScheduleMatrix
            numberOfRounds={numberOfRounds}
            playerTableAssignments={playerTableAssignments}
            players={players}
          />
        ) : (
          <Stack gap="xs">
            <Text fw={500} size="sm">
              {t('gameDetail:teams.players')}:
            </Text>
            {players.map((player) => (
              <Text key={player.id} size="sm">
                {player.name}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

interface TeamsPermissions {
  canAddDelete: boolean;
  canEdit: boolean;
  isCompleted: boolean;
}

const getTeamsPermissions = (status: GameStatus): TeamsPermissions => {
  switch (status) {
    case 'setup':
      return { canAddDelete: true, canEdit: true, isCompleted: false };
    case 'in_progress':
      return { canAddDelete: false, canEdit: true, isCompleted: false };
    case 'completed':
      return { canAddDelete: false, canEdit: false, isCompleted: true };
    default:
      return assertNever(status);
  }
};

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation();
  const { createTeam, updateTeam, deleteTeam } = useTeams();
  const { updatePlayer } = usePlayers();
  const { fetchAllTables, status } = useTables();
  const teams = useTeamsByGameId(game.id);
  const players = usePlayersByGameId(game.id);
  const tables = useTablesByGameId(game.id);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const { canAddDelete, canEdit, isCompleted } = getTeamsPermissions(
    game.status,
  );

  const roundsCount = game.rounds?.length || 0;

  useEffect(() => {
    if (roundsCount > 0 && status === 'idle') {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game.id, game.numberOfRounds, roundsCount, fetchAllTables, status]);

  const showTableAssignments = tables.length > 0;

  const playerTableAssignments = useMemo(() => {
    const assignments: Record<
      number,
      { roundNumber: number; tableNumber: number }[]
    > = {};

    for (const table of tables) {
      const players = table.players;
      if (!players) {
        continue;
      }
      const tableRoundNumber =
        (table as typeof table & { roundNumber?: number }).roundNumber ||
        table.roundID;
      for (const playerID of players) {
        const id = playerID.id;
        assignments[id] ??= [];
        assignments[id].push({
          roundNumber: tableRoundNumber,
          tableNumber: table.tableNumber,
        });
      }
    }

    return assignments;
  }, [tables]);

  const getPlayersForTeam = (teamID: number) => {
    const team = teams.find((t) => t?.id === teamID);
    if (!team) {
      return [];
    }
    return team.players
      .map((playerID) => players.find((p) => p.id === playerID))
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

  const handleStartEditTeam = (teamID: number) => {
    setEditingTeamId(teamID);
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
      for (const player of players) {
        updatePlayer(player.id, player.name);
      }
    }
    setEditTeamDialogOpen(false);
    setEditingTeamId(null);
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
      onConfirm: () => {
        deleteTeam(teamID);
      },
    });
  };

  return (
    <Stack gap="md">
      {canAddDelete ? (
        <Button
          leftSection={<Icon icon={IconPlus} size={20} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setIsTeamFormOpen(true)}
        >
          {t('gameDetail:teams.addTeam')}
        </Button>
      ) : (
        <Tooltip label={t('gameDetail:teams.cannotAddTeamsAfterStart')}>
          <Button
            disabled
            leftSection={<Icon icon={IconPlus} size={20} />}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('gameDetail:teams.addTeam')}
          </Button>
        </Tooltip>
      )}

      {canAddDelete && teams.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('gameDetail:teams.noTeams')}
        </Text>
      )}

      <Stack gap="md">
        {teams.map((team) => {
          if (!team) {
            return null;
          }
          return (
            <TeamCard
              key={team.id}
              canAddDelete={canAddDelete}
              canEdit={canEdit}
              isCompleted={isCompleted}
              numberOfRounds={game.numberOfRounds}
              players={getPlayersForTeam(team.id)}
              playerTableAssignments={playerTableAssignments}
              showTableAssignments={showTableAssignments}
              team={team}
              onDelete={handleDeleteTeam}
              onEdit={handleStartEditTeam}
            />
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
