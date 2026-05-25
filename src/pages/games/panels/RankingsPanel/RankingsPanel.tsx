import { Card, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyStateCard from '../../../../shared/EmptyStateCard';
import { usePlayersByGameId } from '../../../../slices/players/hooks.ts';
import useTables, {
  useTablesByRound,
} from '../../../../slices/tables/hooks.ts';
import { useTeamsByIds } from '../../../../slices/teams/hooks.ts';
import type { Game } from '../../../../slices/types';
import { buildRoundOptions } from '../roundOptions.ts';
import { PlayerRankingRow, TeamRankingRow } from './RankingRow';
import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from './rankingsMapper.ts';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation();
  const [selectedRound, setSelectedRound] = useState<string>('total');

  const players = usePlayersByGameId(game.id);

  const teams = useTeamsByIds(game.teams);

  const roundOptions = useMemo(
    () => buildRoundOptions(t, game.numberOfRounds, { includeTotal: true }),
    [t, game.numberOfRounds],
  );

  const { status } = useTables();

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
    () => mapPlayersToRankings(teams, players, allScores),
    [teams, players, allScores],
  );

  const teamRankings = useMemo(
    () => mapTeamsToRankings(teams, playerRankings),
    [teams, playerRankings],
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
      <EmptyStateCard
        description={[
          t('gameDetail:rankings.noScoresMessage'),
          t('gameDetail:rankings.noScoresInstructions'),
        ]}
        title={t('gameDetail:rankings.noScoresYet')}
      />
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
