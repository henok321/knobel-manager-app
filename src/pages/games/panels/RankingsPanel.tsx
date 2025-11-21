import { Card, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from './rankingsMapper.ts';
import { Game } from '../../../generated';
import useGames from '../../../slices/games/hooks.ts';
import { PlayerRankingRow, TeamRankingRow } from '../components/RankingRow';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const [selectedRound, setSelectedRound] = useState<string>('total');
  const { fetchAllTables } = useGames();

  const teams = useMemo(() => game.teams || [], [game.teams]);
  const rounds = useMemo(() => game.rounds || [], [game.rounds]);
  const roundsCount = rounds.length;

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

  useEffect(() => {
    if (roundsCount > 0) {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [roundsCount, fetchAllTables, game.id, game.numberOfRounds]);

  // Get filtered tables based on selected round
  const filteredTables = useMemo(() => {
    if (selectedRound === 'total') {
      return rounds.flatMap((round) => round.tables || []);
    }
    const selectedRoundNum = Number(selectedRound);
    const round = rounds.find((r) => r.roundNumber === selectedRoundNum);
    return round?.tables || [];
  }, [rounds, selectedRound]);

  const allScores = useMemo(
    () => aggregateScoresFromTables(filteredTables),
    [filteredTables],
  );

  const hasNoScores = useMemo(
    () => Object.keys(allScores).length === 0,
    [allScores],
  );

  const playerRankings = useMemo(
    () => mapPlayersToRankings(teams, allScores),
    [teams, allScores],
  );

  const teamRankings = useMemo(
    () => mapTeamsToRankings(teams, playerRankings),
    [teams, playerRankings],
  );

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
