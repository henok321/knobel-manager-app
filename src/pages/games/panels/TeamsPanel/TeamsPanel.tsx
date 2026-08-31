import { Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetGameTablesQuery } from '../../../../store/api';
import type { Game } from '../../../../store/api.gen.ts';
import EditTeamDialog from './EditTeamDialog';
import TeamCard from './TeamCard';
import TeamForm from './TeamForm';
import { tableAssignmentsByPlayer } from './tableAssignments.ts';
import { useTeamMutations } from './useTeamMutations.ts';

interface TeamsPanelProps {
  game: Game;
}

const TeamsPanel = ({ game }: TeamsPanelProps) => {
  const { t } = useTranslation();
  const { data: tablesData } = useGetGameTablesQuery({ gameId: game.id });
  const tables = tablesData?.tables ?? [];
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const closeTeamForm = () => setIsTeamFormOpen(false);

  const announceTeamCreated = (teamName: string) => {
    notifications.show({
      title: t('common:actions.success'),
      message: t('games:card.teamAdded', { name: teamName }),
      color: 'green',
    });
    closeTeamForm();
  };

  const confirmSetupReset = (onConfirm: () => void) =>
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
      onConfirm,
    });

  const { isSubmitting, removeTeam, saveTeam, submitTeam } = useTeamMutations(
    game,
    { onTeamCreated: announceTeamCreated, confirmSetupReset },
  );

  const confirmDeleteTeam = (teamID: number) =>
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

  const allTeams = game.teams ?? [];
  const query = searchQuery.trim().toLowerCase();
  const teams = query
    ? allTeams.filter((team) => team.name.toLowerCase().includes(query))
    : allTeams;

  const editingTeam = allTeams.find((team) => team.id === editingTeamId);

  const canAddDelete = game.status === 'setup';
  const canEdit = game.status !== 'completed';

  const showTableAssignments = tables.length > 0;
  const playerTableAssignments = tableAssignmentsByPlayer(tables, game.rounds);

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
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            canAddDelete={canAddDelete}
            canEdit={canEdit}
            numberOfRounds={game.numberOfRounds}
            playerTableAssignments={playerTableAssignments}
            showTableAssignments={showTableAssignments}
            team={team}
            onDelete={confirmDeleteTeam}
            onEdit={setEditingTeamId}
          />
        ))}
      </Stack>

      {isTeamFormOpen && (
        <TeamForm
          createTeam={(teamsRequest) => void submitTeam(teamsRequest)}
          isSubmitting={isSubmitting}
          teamSize={game.teamSize}
          onClose={closeTeamForm}
        />
      )}

      {editingTeam && (
        <EditTeamDialog
          players={editingTeam.players ?? []}
          teamName={editingTeam.name}
          onClose={() => setEditingTeamId(null)}
          onSave={(teamName, players) =>
            saveTeam(editingTeam, teamName, players)
          }
        />
      )}
    </Stack>
  );
};

export default TeamsPanel;
