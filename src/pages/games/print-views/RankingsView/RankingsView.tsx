import { Badge, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from '../../panels/RankingsPanel/rankingsMapper.ts';
import PrintHeader from '../PrintHeader';
import RankingsTable from './RankingsTable';

interface RankingsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
  roundNumber?: number;
}

const RankingsView = ({
  game,
  tables,
  teams,
  roundNumber,
}: RankingsViewProps) => {
  const { t } = useTranslation();

  const gameTeams = teams.filter((team) => team.gameID === game.id);

  const relevantTables = roundNumber
    ? tables.filter((table) => table.roundNumber === roundNumber)
    : tables;

  const scoresByPlayer = aggregateScoresFromTables(relevantTables);
  const playerRankings = mapPlayersToRankings(gameTeams, scoresByPlayer);
  const teamRankings = mapTeamsToRankings(gameTeams, scoresByPlayer);

  const roundLabel = roundNumber
    ? `${t('pdf:teamHandout.round')} ${roundNumber}`
    : t('pdf:rankings.total');

  return (
    <Stack gap="md">
      <PrintHeader subtitle={t('pdf:rankings.title')} title={game.name}>
        <Badge color="blue" size="sm" variant="light">
          {roundLabel}
        </Badge>
      </PrintHeader>

      <RankingsTable
        nameLabel={t('pdf:rankings.team')}
        rankings={teamRankings.map((r) => ({
          id: r.teamID,
          name: r.teamName,
          totalScore: r.totalScore,
        }))}
        title={t('pdf:rankings.teamRankings')}
      />
      <RankingsTable
        showTeamColumn
        nameLabel={t('pdf:rankings.player')}
        rankings={playerRankings.map((r) => ({
          id: r.playerID,
          name: r.playerName,
          teamName: r.teamName,
          totalScore: r.totalScore,
        }))}
        title={t('pdf:rankings.playerRankings')}
      />
    </Stack>
  );
};

export default RankingsView;
