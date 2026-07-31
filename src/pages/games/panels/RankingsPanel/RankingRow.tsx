import { Group, Table, Text } from '@mantine/core';
import type { PlayerRanking, TeamRanking } from './rankingsMapper.ts';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface PlayerRankingRowProps {
  ranking: PlayerRanking;
  rank: number;
}

export const PlayerRankingRow = ({ ranking, rank }: PlayerRankingRowProps) => {
  const medal = MEDALS[rank];
  const fw = rank === 1 ? 700 : 400;

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs">
          <Text fw={fw} size="lg">
            {rank}
          </Text>
          {medal && <span style={{ fontSize: '1.2em' }}>{medal}</span>}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={fw}>{ranking.playerName}</Text>
      </Table.Td>
      <Table.Td>
        <Text c="dimmed" size="sm">
          {ranking.teamName}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={fw}>{ranking.totalScore}</Text>
      </Table.Td>
    </Table.Tr>
  );
};

interface TeamRankingRowProps {
  ranking: TeamRanking;
  rank: number;
}

export const TeamRankingRow = ({ ranking, rank }: TeamRankingRowProps) => {
  const medal = MEDALS[rank];
  const fw = rank === 1 ? 700 : 400;

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs">
          <Text fw={fw} size="lg">
            {rank}
          </Text>
          {medal && <span style={{ fontSize: '1.2em' }}>{medal}</span>}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={fw}>{ranking.teamName}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={fw}>{ranking.totalScore}</Text>
      </Table.Td>
    </Table.Tr>
  );
};
