import { Badge, Stack, Title } from '@mantine/core';
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
import PlayerRankingsSection from './PlayerRankingsSection';
import TeamRankingsSection from './TeamRankingsSection';

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
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:rankings.title')}
        </Title>
        <Badge color="blue" size="sm" variant="light">
          {roundLabel}
        </Badge>
      </div>

      <TeamRankingsSection rankings={teamRankings} />
      <PlayerRankingsSection rankings={playerRankings} />
    </Stack>
  );
};

export default RankingsView;
