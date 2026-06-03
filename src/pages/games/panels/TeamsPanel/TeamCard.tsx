import { ActionIcon, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { Player } from '../../../../generated';
import Icon from '../../../../shared/Icon';
import TeamAssignmentMatrix, {
  type RoundTableAssignment,
} from './TeamAssignmentMatrix.tsx';

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
