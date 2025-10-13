import { Alert, Card, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { tablesApi } from '../../../api/apiClient';
import { Table as TableModel } from '../../../generated/models';
import { Game } from '../../../slices/types';
import { RootState } from '../../../store/store';
import {
  PlayerRanking,
  TeamRanking,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from '../../../utils/rankingsMapper';
import { aggregateScoresFromTables } from '../../../utils/scoreAggregator';
import { PlayerRankingRow, TeamRankingRow } from '../components/RankingRow';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerRankings, setPlayerRankings] = useState<PlayerRanking[]>([]);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('total');

  const teamsState = useSelector((state: RootState) => state.teams.entities);
  const playersState = useSelector(
    (state: RootState) => state.players.entities,
  );
  const tablesStatus = useSelector((state: RootState) => state.tables.status);

  const roundOptions = useMemo(
    () => [
      { value: 'total', label: t('pages.gameDetail.rankings.totalRanking') },
      ...Array.from({ length: game.numberOfRounds }, (_, i) => ({
        value: String(i + 1),
        label: `${t('pages.gameDetail.rounds.round')} ${i + 1}`,
      })),
    ],
    [game.numberOfRounds, t],
  );

  useEffect(() => {
    const fetchAndCalculateRankings = async () => {
      setLoading(true);
      setError(null);

      try {
        const roundsToFetch =
          selectedRound === 'total'
            ? Array.from({ length: game.numberOfRounds }, (_, i) => i + 1)
            : [Number(selectedRound)];

        const allTables: TableModel[] = [];
        for (const roundNum of roundsToFetch) {
          try {
            const response = await tablesApi.getTables(game.id, roundNum);
            const tables = response.data.tables;

            if (Array.isArray(tables)) {
              allTables.push(...tables);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`No tables for round ${roundNum}`, err);
          }
        }

        const allScores = aggregateScoresFromTables(allTables);

        const gameTeams = game.teams
          .map((teamId) => teamsState[teamId])
          .filter((team) => team !== undefined);

        const playerRankingsData = mapPlayersToRankings(
          gameTeams,
          playersState,
          allScores,
        );
        setPlayerRankings(playerRankingsData);

        const teamRankingsData = mapTeamsToRankings(
          gameTeams,
          playerRankingsData,
        );
        setTeamRankings(teamRankingsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('global.errorOccurred'),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateRankings();
  }, [
    game.id,
    game.numberOfRounds,
    game.teams,
    playersState,
    teamsState,
    selectedRound,
    tablesStatus,
    t,
  ]);

  if (loading) {
    return (
      <Text c="dimmed" ta="center">
        {t('global.loading')}
      </Text>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={t('global.error')}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      {/* Round Filter */}
      <Select
        data={roundOptions}
        label={t('pages.gameDetail.rankings.filterByRound')}
        style={{ width: 250 }}
        value={selectedRound}
        onChange={(value) => setSelectedRound(value || 'total')}
      />

      {/* Team Rankings */}
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>{t('pages.gameDetail.rankings.teamRankings')}</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('pages.gameDetail.rankings.rank')}</Table.Th>
                <Table.Th>{t('pages.gameDetail.rankings.team')}</Table.Th>
                <Table.Th>{t('pages.gameDetail.rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center">
                      {t('pages.gameDetail.rankings.noData')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                teamRankings.map((ranking, index) => (
                  <TeamRankingRow
                    key={ranking.teamId}
                    isTopRank={index === 0}
                    rank={index + 1}
                    ranking={ranking}
                  />
                ))
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      {/* Player Rankings */}
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>
            {t('pages.gameDetail.rankings.playerRankings')}
          </Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('pages.gameDetail.rankings.rank')}</Table.Th>
                <Table.Th>{t('pages.gameDetail.rankings.player')}</Table.Th>
                <Table.Th>{t('pages.gameDetail.rankings.team')}</Table.Th>
                <Table.Th>{t('pages.gameDetail.rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {playerRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">
                      {t('pages.gameDetail.rankings.noData')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                playerRankings.map((ranking, index) => (
                  <PlayerRankingRow
                    key={ranking.playerId}
                    isTopRank={index === 0}
                    rank={index + 1}
                    ranking={ranking}
                  />
                ))
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>
    </Stack>
  );
};

export default RankingsPanel;
