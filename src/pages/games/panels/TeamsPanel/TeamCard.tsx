import { ActionIcon, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Team } from '../../../../store/api.gen.ts';
import TeamAssignmentMatrix, {
  type RoundTableAssignment,
} from './TeamAssignmentMatrix.tsx';

interface TeamCardProps {
  team: Team;
  numberOfRounds: number;
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  showTableAssignments: boolean;
  canEdit: boolean;
  canAddDelete: boolean;
  onEdit: (teamID: number) => void;
  onDelete: (teamID: number) => void;
}

const TeamCard = ({
  team,
  numberOfRounds,
  playerTableAssignments,
  showTableAssignments,
  canEdit,
  canAddDelete,
  onEdit,
  onDelete,
}: TeamCardProps) => {
  const { t } = useTranslation();
  const players = team.players ?? [];

  return (
    <Card padding="lg">
      <Stack gap="md">
        <Group align="center" justify="space-between">
          <Title order={3}>{team.name}</Title>
          {(canEdit || canAddDelete) && (
            <Group gap="xs">
              {canEdit && (
                <ActionIcon variant="subtle" onClick={() => onEdit(team.id)}>
                  <IconPencil size={16} stroke={1.5} />
                </ActionIcon>
              )}
              {canAddDelete && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => onDelete(team.id)}
                >
                  <IconTrash size={16} stroke={1.5} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Group>

        {showTableAssignments ? (
          <TeamAssignmentMatrix
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

export default TeamCard;
