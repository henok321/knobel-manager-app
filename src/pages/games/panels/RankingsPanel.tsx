import { Card, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from './rankingsMapper.ts';
import { useGetAllTablesForGameQuery } from '../../../api/rtkQueryApi.ts';
import usePlayers from '../../../hooks/usePlayers';
import useTeams, { useTeamsByIds } from '../../../hooks/useTeams';
import { Game } from '../../../types';
import { PlayerRankingRow, TeamRankingRow } from '../components/RankingRow';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const [selectedRound, setSelectedRound] = useState<string>('total');

  useTeams();
  const { allPlayers } = usePlayers();

  const hasRounds = game.rounds && game.rounds.length > 0;
  const { data: allTables = [], isLoading } = useGetAllTablesForGameQuery(
    { gameId: game.id, numberOfRounds: game.numberOfRounds },
    { skip: !hasRounds },
  );

  const gameTeams = useTeamsByIds(game.teams);

  const roundOptions = useMemo(
    () => [
      { value: 'total', label: t('rankings.totalRanking') },
      ...Array.from({ length: game.numberOfRounds }, (_, i) => ({
        value: String(i + 1),
        label: `${t('rounds.round')} ${i + 1}`,
      })),
    ],
    [game.numberOfRounds, t],
  );

  const filteredTables = useMemo(() => {
    if (selectedRound === 'total') {
      return allTables;
    }
    return allTables.filter(
      (table) => table.roundNumber === Number(selectedRound),
    );
  }, [allTables, selectedRound]);

  const allScores = useMemo(
    () => aggregateScoresFromTables(filteredTables),
    [filteredTables],
  );

  const hasNoScores = useMemo(
    () => Object.keys(allScores).length === 0,
    [allScores],
  );

  const playerRankings = useMemo(
    () => mapPlayersToRankings(gameTeams, allPlayers, allScores),
    [gameTeams, allPlayers, allScores],
  );

  const teamRankings = useMemo(
    () => mapTeamsToRankings(gameTeams, playerRankings),
    [gameTeams, playerRankings],
  );

  if (isLoading) {
    return (
      <Text c="dimmed" ta="center">
        {t('actions.loading')}
      </Text>
    );
  }

  if (hasNoScores && teamRankings.length === 0) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Stack align="center" gap="md">
          <Title order={4}>{t('rankings.noScoresYet')}</Title>
          <Text c="dimmed" size="sm" ta="center">
            {t('rankings.noScoresMessage')}
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            {t('rankings.noScoresInstructions')}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="xl">
      {/* Round Filter */}
      <Select
        data={roundOptions}
        label={t('rankings.filterByRound')}
        style={{ width: 250 }}
        value={selectedRound}
        onChange={(value) => setSelectedRound(value || 'total')}
      />

      {/* Team Rankings */}
      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>{t('rankings.teamRankings')}</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('rankings.rank')}</Table.Th>
                <Table.Th>{t('rankings.team')}</Table.Th>
                <Table.Th>{t('rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center">
                      {t('rankings.noData')}
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
          <Title order={3}>{t('rankings.playerRankings')}</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('rankings.rank')}</Table.Th>
                <Table.Th>{t('rankings.player')}</Table.Th>
                <Table.Th>{t('rankings.team')}</Table.Th>
                <Table.Th>{t('rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {playerRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">
                      {t('rankings.noData')}
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
