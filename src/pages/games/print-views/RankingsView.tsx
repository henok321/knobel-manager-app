import { Title, Text, Table, Stack, Badge } from '@mantine/core';
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
  playerID: number;
  playerName: string;
  teamID: number;
  teamName: string;
  totalScore: number;
}

interface TeamRanking {
  teamID: number;
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
  const { t } = useTranslation();

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
    team.players.forEach((playerID: number) => {
      const player = players.find((p) => p.id === playerID);
      if (!player) return;

      playerRankings.push({
        playerID: player.id,
        playerName: player.name,
        teamID: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[player.id] || 0,
      });
    });
  });
  playerRankings.sort((a, b) => b.totalScore - a.totalScore);

  const teamScoresMap: Record<number, number> = {};
  gameTeams.forEach((team) => {
    teamScoresMap[team.id] = 0;
  });
  playerRankings.forEach((playerRank) => {
    teamScoresMap[playerRank.teamID] =
      (teamScoresMap[playerRank.teamID] || 0) + playerRank.totalScore;
  });

  const teamRankings: TeamRanking[] = Object.entries(teamScoresMap).map(
    ([teamIDStr, totalScore]) => {
      const teamID = Number(teamIDStr);
      const team = teams.find((t) => t.id === teamID);
      return {
        teamID,
        teamName: team?.name || 'Unknown',
        totalScore,
      };
    },
  );
  teamRankings.sort((a, b) => b.totalScore - a.totalScore);

  const roundLabel = roundNumber
    ? `${t('pdf:teamHandout.round')} ${roundNumber}`
    : t('pdf:rankings.total');

  return (
    <Stack gap="md">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:rankings.title')}
        </Title>
        <Badge color="blue" size="sm" variant="light">
          {roundLabel}
        </Badge>
      </div>

      <Stack gap="xs">
        <Title order={3}>{t('pdf:rankings.teamRankings')}</Title>

        {teamRankings.length === 0 ? (
          <Text c="dimmed" fs="italic">
            {t('pdf:rankings.noData')}
          </Text>
        ) : (
          <Table highlightOnHover striped withColumnBorders withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>
                  {t('pdf:rankings.rank')}
                </Table.Th>
                <Table.Th>{t('pdf:rankings.team')}</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'right' }}>
                  {t('pdf:rankings.totalScore')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamRankings.map((ranking, index) => (
                <Table.Tr key={ranking.teamID}>
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
                    <Text fw={index === 0 ? 700 : 500}>{ranking.teamName}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
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

      <Stack gap="xs">
        <Title order={3}>{t('pdf:rankings.playerRankings')}</Title>

        {playerRankings.length === 0 ? (
          <Text c="dimmed" fs="italic">
            {t('pdf:rankings.noData')}
          </Text>
        ) : (
          <Table highlightOnHover striped withColumnBorders withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>
                  {t('pdf:rankings.rank')}
                </Table.Th>
                <Table.Th>{t('pdf:rankings.player')}</Table.Th>
                <Table.Th>{t('pdf:rankings.team')}</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'right' }}>
                  {t('pdf:rankings.totalScore')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {playerRankings.map((ranking, index) => (
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
                    <Text fw={index === 0 ? 700 : 500}>
                      {ranking.playerName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed">{ranking.teamName}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
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
    </Stack>
  );
};

export default RankingsView;
