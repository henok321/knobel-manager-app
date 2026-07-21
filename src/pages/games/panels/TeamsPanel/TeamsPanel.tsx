import { Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useGetGameTablesQuery,
  useUpdatePlayerMutation,
  useUpdateTeamMutation,
} from '../../../../store/api';
import type { Game, GameStatus } from '../../../../store/generatedApi.ts';
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
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [updatePlayer] = useUpdatePlayerMutation();
  const { data: tablesData } = useGetGameTablesQuery({ gameId: game.id });
  const tables = tablesData?.tables ?? [];
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
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

  const handleCreateTeam = (teamData: TeamFormData) => {
    const teamsRequest = {
      name: teamData.name,
      players: teamData.members.map((name) => ({ name })),
    };
    void createTeam({ gameId: game.id, teamsRequest });
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
      void updateTeam({
        gameId: game.id,
        teamId: editingTeamId,
        teamsRequest: { name: teamName },
      });

      for (const player of players) {
        void updatePlayer({
          gameId: game.id,
          teamId: editingTeamId,
          playerId: player.id,
          playersRequest: { name: player.name },
        });
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
        void deleteTeam({ gameId: game.id, teamId: teamID });
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
              isCompleted={isCompleted}
              numberOfRounds={game.numberOfRounds}
              players={team.players ?? []}
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
          players={allTeams.find((t) => t.id === editingTeamId)?.players ?? []}
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
