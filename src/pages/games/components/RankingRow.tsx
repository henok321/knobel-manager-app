import { Table, Text } from '@mantine/core';

import { PlayerRanking, TeamRanking } from '../../../utils/rankingsMapper';

interface PlayerRankingRowProps {
  ranking: PlayerRanking;
  rank: number;
  isTopRank?: boolean;
}

export const PlayerRankingRow = ({
  ranking,
  rank,
  isTopRank = false,
}: PlayerRankingRowProps) => (
  <Table.Tr key={ranking.playerId}>
    <Table.Td>
      <Text fw={isTopRank ? 700 : 400} size="lg">
        {rank}
      </Text>
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

interface TeamRankingRowProps {
  ranking: TeamRanking;
  rank: number;
  isTopRank?: boolean;
}

export const TeamRankingRow = ({
  ranking,
  rank,
  isTopRank = false,
}: TeamRankingRowProps) => (
  <Table.Tr key={ranking.teamId}>
    <Table.Td>
      <Text fw={isTopRank ? 700 : 400} size="lg">
        {rank}
      </Text>
    </Table.Td>
    <Table.Td>
      <Text fw={isTopRank ? 700 : 400}>{ranking.teamName}</Text>
    </Table.Td>
    <Table.Td>
      <Text fw={isTopRank ? 700 : 400}>{ranking.totalScore}</Text>
    </Table.Td>
  </Table.Tr>
);
