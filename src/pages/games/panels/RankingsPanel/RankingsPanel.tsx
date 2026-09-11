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
import { tableAssignmentsByPlayer } from '../../../../utils/tableAssignments.ts';
import ScoreDetailModal from './ScoreDetailModal.tsx';

interface RankingsPanelProps {
  game: Game;
}

type Selection = { kind: 'team' | 'player'; id: number };

const RankingsPanel = ({ game }: RankingsPanelProps) => {
  const { t } = useTranslation();
  const [selectedRound, setSelectedRound] = useState<string>('total');
  const [selection, setSelection] = useState<Selection | null>(null);

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

  const playerTableAssignments = tableAssignmentsByPlayer(
    allTables,
    game.rounds,
  );

  const selectedTeam =
    selection === null
      ? undefined
      : teams.find((team) =>
          selection.kind === 'team'
            ? team.id === selection.id
            : (team.players ?? []).some((player) => player.id === selection.id),
        );
  const selectedPlayers =
    selection === null || selectedTeam === undefined
      ? []
      : selection.kind === 'team'
        ? (selectedTeam.players ?? [])
        : (selectedTeam.players ?? []).filter(
            (player) => player.id === selection.id,
          );

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
            onRowSelect={(row) => setSelection({ kind: 'team', id: row.id })}
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
            onRowSelect={(row) => setSelection({ kind: 'player', id: row.id })}
          />
        </Stack>
      </Card>

      {selectedPlayers.length > 0 && (
        <ScoreDetailModal
          numberOfRounds={game.numberOfRounds}
          playerTableAssignments={playerTableAssignments}
          players={selectedPlayers}
          title={
            selection?.kind === 'team'
              ? (selectedTeam?.name ?? '')
              : t('gameDetail:rankings.detailTitle', {
                  player: selectedPlayers[0]?.name ?? '',
                  team: selectedTeam?.name ?? '',
                })
          }
          onClose={() => setSelection(null)}
        />
      )}
    </Stack>
  );
};

export default RankingsPanel;
