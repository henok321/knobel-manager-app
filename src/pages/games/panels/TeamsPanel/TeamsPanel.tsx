import { Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../shared/Icon';
import usePlayers, {
  usePlayersByGameId,
} from '../../../../slices/players/hooks';
import { useTablesByGameId } from '../../../../slices/tables/hooks';
import useTeams, {
  useTeamsByGameId,
  useTeamsByGameIdWithSearch,
} from '../../../../slices/teams/hooks';
import type { Game, GameStatus } from '../../../../slices/types';
import { assertNever } from '../../../../utils/assertNever';
import EditTeamDialog from './EditTeamDialog';
import TeamCard from './TeamCard';
import TeamForm, { type TeamFormData } from './TeamForm';

interface TeamsPanelProps {
  game: Game;
}

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
  const players = usePlayersByGameId(game.id);
  const tables = useTablesByGameId(game.id);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const allTeams = useTeamsByGameId(game.id);
  const teams = useTeamsByGameIdWithSearch(game.id, searchQuery);

  const { canAddDelete, canEdit, isCompleted } = getTeamsPermissions(
    game.status,
  );

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
      (table as typeof table & { roundNumber?: number }).roundNumber ||
      table.roundID;
    for (const playerID of tablePlayers) {
      const id = playerID.id;
      playerTableAssignments[id] ??= [];
      playerTableAssignments[id].push({
        roundNumber: tableRoundNumber,
        tableNumber: table.tableNumber,
      });
    }
  }

  const getPlayersForTeam = (teamID: number) => {
    const team = allTeams.find((t) => t.id === teamID);
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
      <Group align="flex-end" justify="space-between" wrap="wrap">
        <TextInput
          placeholder={t('gameDetail:teams.searchTeams')}
          style={{ width: 250 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
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
