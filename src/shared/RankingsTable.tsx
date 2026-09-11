import { Anchor, rem, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { RankingsRow } from '../utils/rankings.ts';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface RankingsTableProps {
  nameLabel: string;
  rankings: RankingsRow[];
  showTeamColumn?: boolean;
  onRowSelect?: (row: RankingsRow) => void;
}

const RankingsTable = ({
  nameLabel,
  rankings,
  showTeamColumn = false,
  onRowSelect,
}: RankingsTableProps) => {
  const { t } = useTranslation();

  if (rankings.length === 0) {
    return (
      <Text c="dimmed" fs="italic" ta="center">
        {t('common:rankings.noData')}
      </Text>
    );
  }

  return (
    <Table
      striped
      withColumnBorders
      withTableBorder
      highlightOnHover={Boolean(onRowSelect)}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={rem(80)}>{t('common:rankings.rank')}</Table.Th>
          <Table.Th>{nameLabel}</Table.Th>
          {showTeamColumn && <Table.Th>{t('common:rankings.team')}</Table.Th>}
          <Table.Th style={{ textAlign: 'right' }} w={rem(120)}>
            {t('common:rankings.totalScore')}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rankings.map((row, index) => {
          const rank = index + 1;
          const medal = MEDALS[rank];
          const fw = rank === 1 ? 700 : 400;

          return (
            <Table.Tr
              key={row.id}
              style={onRowSelect ? { cursor: 'pointer' } : undefined}
              onClick={onRowSelect ? () => onRowSelect(row) : undefined}
            >
              <Table.Td>
                <Text fw={fw}>{medal ? `${rank} ${medal}` : rank}</Text>
              </Table.Td>
              <Table.Td>
                {onRowSelect ? (
                  <Anchor
                    aria-label={t('common:rankings.showDetails', {
                      name: row.name,
                    })}
                    component="button"
                    fw={fw}
                    type="button"
                    underline="hover"
                  >
                    {row.name}
                  </Anchor>
                ) : (
                  <Text fw={fw}>{row.name}</Text>
                )}
              </Table.Td>
              {showTeamColumn && (
                <Table.Td>
                  <Text c="dimmed" size="sm">
                    {row.teamName}
                  </Text>
                </Table.Td>
              )}
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={fw}>{row.totalScore}</Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};

export default RankingsTable;
