import {
  Badge,
  Button,
  Card,
  Group,
  Table as MantineTable,
  Stack,
  Title,
} from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Table, Team } from '../../../../store/generatedApi.ts';
import { PlayerScoreRow } from './PlayerScoreRow';

interface RoundTableCardProps {
  table: Table;
  teams: Team[];
  canEditScores: boolean;
  onEditScores: (table: Table) => void;
}

const RoundTableCard = ({
  table,
  teams,
  canEditScores,
  onEditScores,
}: RoundTableCardProps) => {
  const { t } = useTranslation();
  const hasScores = (table.scores?.length ?? 0) > 0;

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group align="center" justify="space-between">
          <Group gap="xs">
            <Title order={4}>
              {`${t('gameDetail:rounds.table')} ${table.tableNumber}`}
            </Title>
            {hasScores ? (
              <Badge
                color="green"
                leftSection={<IconCheck size={14} stroke={1.5} />}
                variant="light"
              >
                {t('gameDetail:rounds.scoresEntered')}
              </Badge>
            ) : (
              <Badge
                color="gray"
                leftSection={<IconClock size={14} stroke={1.5} />}
                variant="light"
              >
                {t('gameDetail:rounds.scoresPending')}
              </Badge>
            )}
          </Group>
          {canEditScores && (
            <Button
              size="sm"
              variant="light"
              onClick={() => onEditScores(table)}
            >
              {hasScores
                ? t('gameDetail:rounds.editScores')
                : t('gameDetail:rounds.enterScores')}
            </Button>
          )}
        </Group>

        <MantineTable
          className="rounds-table"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <colgroup>
            <col style={{ width: '50%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <MantineTable.Thead>
            <MantineTable.Tr>
              <MantineTable.Th>{t('gameDetail:rounds.player')}</MantineTable.Th>
              <MantineTable.Th>{t('gameDetail:rounds.team')}</MantineTable.Th>
              <MantineTable.Th>{t('gameDetail:rounds.score')}</MantineTable.Th>
            </MantineTable.Tr>
          </MantineTable.Thead>
          <MantineTable.Tbody>
            {table.players?.map((player) => {
              const playerScore = table.scores?.find(
                (s) => s.playerID === player.id,
              );
              const team = player.teamID
                ? teams.find((tm) => tm.id === player.teamID)
                : undefined;
              return (
                <PlayerScoreRow
                  key={player.id}
                  player={player}
                  score={playerScore}
                  team={team}
                />
              );
            })}
          </MantineTable.Tbody>
        </MantineTable>
      </Stack>
    </Card>
  );
};

export default RoundTableCard;
