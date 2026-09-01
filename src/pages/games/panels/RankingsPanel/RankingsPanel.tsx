import { Card, Select, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyStateCard from '../../../../shared/EmptyStateCard';
import RankingsTable from '../../../../shared/RankingsTable.tsx';
import type { Game } from '../../../../store/api.gen.ts';
import { useGetGameTablesQuery } from '../../../../store/api.ts';
import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from '../../../../utils/rankings.ts';
import {
  buildRoundOptions,
  roundNumberById,
} from '../../../../utils/rounds.ts';

interface RankingsPanelProps {
  game: Game;
}

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation();
  const [selectedRound, setSelectedRound] = useState<string>('total');

  const teams = game.teams ?? [];
  const roundNumbers = roundNumberById(game.rounds);

  const { data: allTablesData, isLoading: loading } = useGetGameTablesQuery({
    gameId: game.id,
  });
  const allTables = allTablesData?.tables ?? [];

  const filteredTables =
    selectedRound === 'total'
      ? allTables
      : allTables.filter(
          (table) => roundNumbers.get(table.roundID) === Number(selectedRound),
        );

  const allScores = aggregateScoresFromTables(filteredTables);
  const playerRankings = mapPlayersToRankings(teams, allScores);
  const teamRankings = mapTeamsToRankings(teams, allScores);

  if (loading) {
    return (
      <Text c="dimmed" ta="center">
        {t('common:actions.loading')}
      </Text>
    );
  }

  if (Object.keys(allScores).length === 0 && teamRankings.length === 0) {
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
        data={buildRoundOptions(t, game.numberOfRounds, { includeTotal: true })}
        label={t('gameDetail:rankings.filterByRound')}
        style={{ width: 250 }}
        value={selectedRound}
        onChange={(value) => setSelectedRound(value || 'total')}
      />

      <Card padding="lg">
        <Stack gap="md">
          <Title order={3}>{t('common:rankings.teamRankings')}</Title>
          <RankingsTable
            nameLabel={t('common:rankings.team')}
            rankings={teamRankings}
          />
        </Stack>
      </Card>

      <Card padding="lg">
        <Stack gap="md">
          <Title order={3}>{t('common:rankings.playerRankings')}</Title>
          <RankingsTable
            showTeamColumn
            nameLabel={t('common:rankings.player')}
            rankings={playerRankings}
          />
        </Stack>
      </Card>
    </Stack>
  );
};

export default RankingsPanel;
