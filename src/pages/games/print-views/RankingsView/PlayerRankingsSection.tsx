import { Badge, rem, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { PlayerRanking } from '../../panels/RankingsPanel/rankingsMapper.ts';

interface PlayerRankingsSectionProps {
  rankings: PlayerRanking[];
}

const PlayerRankingsSection = ({ rankings }: PlayerRankingsSectionProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <Title order={3}>{t('pdf:rankings.playerRankings')}</Title>

      {rankings.length === 0 ? (
        <Text c="dimmed" fs="italic">
          {t('pdf:rankings.noData')}
        </Text>
      ) : (
        <Table highlightOnHover striped withColumnBorders withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: rem(60), textAlign: 'center' }}>
                {t('pdf:rankings.rank')}
              </Table.Th>
              <Table.Th>{t('pdf:rankings.player')}</Table.Th>
              <Table.Th>{t('pdf:rankings.team')}</Table.Th>
              <Table.Th style={{ width: rem(100), textAlign: 'right' }}>
                {t('pdf:rankings.totalScore')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rankings.map((ranking, index) => (
              <Table.Tr key={ranking.playerID}>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Badge
                    color={index === 0 ? 'yellow' : 'blue'}
                    size="sm"
                    variant={index === 0 ? 'filled' : 'light'}
                  >
                    {index + 1}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={index === 0 ? 700 : 500}>{ranking.playerName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text c="dimmed">{ranking.teamName}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text fw={index === 0 ? 700 : 400}>{ranking.totalScore}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
};

export default PlayerRankingsSection;
