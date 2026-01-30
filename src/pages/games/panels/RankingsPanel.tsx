import { Card, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from './rankingsMapper.ts';
import usePlayers from '../../../slices/players/hooks.ts';
import useTables, { useTablesByRound } from '../../../slices/tables/hooks.ts';
import useTeams, { useTeamsByIds } from '../../../slices/teams/hooks.ts';
import { Game } from '../../../slices/types';
import { PlayerRankingRow, TeamRankingRow } from '../components/RankingRow';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation();
  const [selectedRound, setSelectedRound] = useState<string>('total');

  useTeams();
  const { allPlayers } = usePlayers();
  const { fetchAllTables, status } = useTables();

  const gameTeams = useTeamsByIds(game.teams);

  const roundOptions = useMemo(
    () => [
      { value: 'total', label: t('gameDetail:rankings.totalRanking') },
      ...Array.from({ length: game.numberOfRounds }, (_, i) => ({
        value: String(i + 1),
        label: `${t('gameDetail:rounds.round')} ${i + 1}`,
      })),
    ],
    [game.numberOfRounds, t],
  );

  const roundsCount = game.rounds?.length || 0;

  useEffect(() => {
    if (roundsCount > 0 && status === 'idle') {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [roundsCount, status, fetchAllTables, game.id, game.numberOfRounds]);

  const filteredTables = useTablesByRound(
    game.id,
    selectedRound === 'total' ? null : Number(selectedRound),
  );

  const allScores = useMemo(
    () => aggregateScoresFromTables(filteredTables),
    [filteredTables],
  );

  const hasNoScores = Object.keys(allScores).length === 0;

  const playerRankings = useMemo(
    () => mapPlayersToRankings(gameTeams, allPlayers, allScores),
    [gameTeams, allPlayers, allScores],
  );

  const teamRankings = useMemo(
    () => mapTeamsToRankings(gameTeams, playerRankings),
    [gameTeams, playerRankings],
  );

  const loading = status === 'pending';

  if (loading) {
    return (
      <Text c="dimmed" ta="center">
        {t('common:actions.loading')}
      </Text>
    );
  }

  if (hasNoScores && teamRankings.length === 0) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Stack align="center" gap="md">
          <Title order={4}>{t('gameDetail:rankings.noScoresYet')}</Title>
          <Text c="dimmed" size="sm" ta="center">
            {t('gameDetail:rankings.noScoresMessage')}
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            {t('gameDetail:rankings.noScoresInstructions')}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="xl">
      <Select
        data={roundOptions}
        label={t('gameDetail:rankings.filterByRound')}
        style={{ width: 250 }}
        value={selectedRound}
        onChange={(value) => setSelectedRound(value || 'total')}
      />

      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>{t('gameDetail:rankings.teamRankings')}</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('gameDetail:rankings.rank')}</Table.Th>
                <Table.Th>{t('gameDetail:rankings.team')}</Table.Th>
                <Table.Th>{t('gameDetail:rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center">
                      {t('gameDetail:rankings.noData')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                teamRankings.map((ranking, index) => (
                  <TeamRankingRow
                    key={ranking.teamID}
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

      <Card withBorder padding="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>{t('gameDetail:rankings.playerRankings')}</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('gameDetail:rankings.rank')}</Table.Th>
                <Table.Th>{t('gameDetail:rankings.player')}</Table.Th>
                <Table.Th>{t('gameDetail:rankings.team')}</Table.Th>
                <Table.Th>{t('gameDetail:rankings.totalScore')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {playerRankings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">
                      {t('gameDetail:rankings.noData')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                playerRankings.map((ranking, index) => (
                  <PlayerRankingRow
                    key={ranking.playerID}
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
