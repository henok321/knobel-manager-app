import { Group, Table, Text } from '@mantine/core';
import type { PlayerRanking, TeamRanking } from './rankingsMapper.ts';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const getMedalEmoji = (rank: number) => MEDALS[rank] ?? null;

interface PlayerRankingRowProps {
  ranking: PlayerRanking;
  rank: number;
  isTopRank?: boolean;
}

export const PlayerRankingRow = ({
  ranking,
  rank,
  isTopRank = false,
}: PlayerRankingRowProps) => {
  const medal = getMedalEmoji(rank);

  return (
    <Table.Tr>
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
};

interface TeamRankingRowProps {
  ranking: TeamRanking;
  rank: number;
  isTopRank?: boolean;
}

export const TeamRankingRow = ({
  ranking,
  rank,
  isTopRank = false,
}: TeamRankingRowProps) => {
  const medal = getMedalEmoji(rank);

  return (
    <Table.Tr>
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
};
