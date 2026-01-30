import { Group, Table, Text } from '@mantine/core';
import { memo } from 'react';

import { PlayerRanking, TeamRanking } from '../panels/rankingsMapper.ts';

const getMedalEmoji = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

interface PlayerRankingRowProps {
  ranking: PlayerRanking;
  rank: number;
  isTopRank?: boolean;
}

export const PlayerRankingRow = memo(function PlayerRankingRow({
  ranking,
  rank,
  isTopRank = false,
}: PlayerRankingRowProps) {
  const medal = getMedalEmoji(rank);

  return (
    <Table.Tr key={ranking.playerID}>
      <Table.Td>
        <Group gap="xs">
          <Text fw={isTopRank ? 700 : 400} size="lg">
            {rank}
          </Text>
          {medal && <span style={{ fontSize: '1.2em' }}>{medal}</span>}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={isTopRank ? 700 : 400}>{ranking.playerName}</Text>
      </Table.Td>
      <Table.Td>
        <Text c="dimmed" size="sm">
          {ranking.teamName}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={isTopRank ? 700 : 400}>{ranking.totalScore}</Text>
      </Table.Td>
    </Table.Tr>
  );
});

interface TeamRankingRowProps {
  ranking: TeamRanking;
  rank: number;
  isTopRank?: boolean;
}

export const TeamRankingRow = memo(function TeamRankingRow({
  ranking,
  rank,
  isTopRank = false,
}: TeamRankingRowProps) {
  const medal = getMedalEmoji(rank);

  return (
    <Table.Tr key={ranking.teamID}>
      <Table.Td>
        <Group gap="xs">
          <Text fw={isTopRank ? 700 : 400} size="lg">
            {rank}
          </Text>
          {medal && <span style={{ fontSize: '1.2em' }}>{medal}</span>}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={isTopRank ? 700 : 400}>{ranking.teamName}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={isTopRank ? 700 : 400}>{ranking.totalScore}</Text>
      </Table.Td>
    </Table.Tr>
  );
});
