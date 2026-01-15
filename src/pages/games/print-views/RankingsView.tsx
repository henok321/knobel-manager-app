import {
  Title,
  Text,
  Paper,
  Table,
  Stack,
  Divider,
  Badge,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Table as TableType, Player, Game, Team } from '../../../slices/types';

interface RankingsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
  roundNumber?: number;
}

interface PlayerRanking {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  totalScore: number;
}

interface TeamRanking {
  teamId: number;
  teamName: string;
  totalScore: number;
}

const RankingsView = ({
  game,
  tables,
  players,
  teams,
  roundNumber,
}: RankingsViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  const gameTeams = teams.filter((team) => team.gameID === game.id);

  const relevantTables = roundNumber
    ? tables.filter((table) => table.roundNumber === roundNumber)
    : tables;

  const scoresByPlayer: Record<number, number> = {};
  relevantTables.forEach((table) => {
    (table.scores || []).forEach((score) => {
      scoresByPlayer[score.playerID] =
        (scoresByPlayer[score.playerID] || 0) + (score.score || 0);
    });
  });

  const playerRankings: PlayerRanking[] = [];
  gameTeams.forEach((team) => {
    team.players.forEach((playerId: number) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      playerRankings.push({
        playerId: player.id,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[player.id] || 0,
      });
    });
  });
  playerRankings.sort((a, b) => b.totalScore - a.totalScore);

  // Calculate team rankings
  const teamScoresMap: Record<number, number> = {};
  gameTeams.forEach((team) => {
    teamScoresMap[team.id] = 0;
  });
  playerRankings.forEach((playerRank) => {
    teamScoresMap[playerRank.teamId] =
      (teamScoresMap[playerRank.teamId] || 0) + playerRank.totalScore;
  });

  const teamRankings: TeamRanking[] = Object.entries(teamScoresMap).map(
    ([teamIdStr, totalScore]) => {
      const teamId = Number(teamIdStr);
      const team = teams.find((t) => t.id === teamId);
      return {
        teamId,
        teamName: team?.name || 'Unknown',
        totalScore,
      };
    },
  );
  teamRankings.sort((a, b) => b.totalScore - a.totalScore);

  const roundLabel = roundNumber
    ? `${t('rankings.round')} ${roundNumber}`
    : t('rankings.total');

  return (
    <Stack gap="xl">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('rankings.title')}
        </Title>
        <Badge color="blue" size="lg" variant="light">
          {roundLabel}
        </Badge>
      </div>

      <Paper withBorder p="lg">
        <Stack gap="md">
          <Title order={3}>{t('rankings.teamRankings')}</Title>
          <Divider />

          {teamRankings.length === 0 ? (
            <Text c="dimmed" fs="italic">
              {t('rankings.noData')}
            </Text>
          ) : (
            <Table highlightOnHover striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '80px', textAlign: 'center' }}>
                    {t('rankings.rank')}
                  </Table.Th>
                  <Table.Th>{t('rankings.team')}</Table.Th>
                  <Table.Th style={{ width: '120px', textAlign: 'center' }}>
                    {t('rankings.totalScore')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {teamRankings.map((ranking, index) => (
                  <Table.Tr key={ranking.teamId}>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge
                        color={index === 0 ? 'yellow' : 'blue'}
                        size="lg"
                        variant={index === 0 ? 'filled' : 'light'}
                      >
                        {index + 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={index === 0 ? 700 : 500}>
                        {ranking.teamName}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Text fw={index === 0 ? 700 : 400}>
                        {ranking.totalScore}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="lg">
        <Stack gap="md">
          <Title order={3}>{t('rankings.playerRankings')}</Title>
          <Divider />

          {playerRankings.length === 0 ? (
            <Text c="dimmed" fs="italic">
              {t('rankings.noData')}
            </Text>
          ) : (
            <Table highlightOnHover striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '80px', textAlign: 'center' }}>
                    {t('rankings.rank')}
                  </Table.Th>
                  <Table.Th>{t('rankings.player')}</Table.Th>
                  <Table.Th>{t('rankings.team')}</Table.Th>
                  <Table.Th style={{ width: '120px', textAlign: 'center' }}>
                    {t('rankings.totalScore')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {playerRankings.map((ranking, index) => (
                  <Table.Tr key={ranking.playerId}>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge
                        color={index === 0 ? 'yellow' : 'blue'}
                        size="lg"
                        variant={index === 0 ? 'filled' : 'light'}
                      >
                        {index + 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={index === 0 ? 700 : 500}>
                        {ranking.playerName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed">{ranking.teamName}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Text fw={index === 0 ? 700 : 400}>
                        {ranking.totalScore}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default RankingsView;
