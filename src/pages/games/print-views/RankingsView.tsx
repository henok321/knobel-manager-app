import { Badge, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import RankingsTable from '../../../shared/RankingsTable.tsx';
import type { Game, Team } from '../../../store/api.gen.ts';
import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from '../../../utils/rankings.ts';
import type { RoundTable } from '../../../utils/rounds.ts';
import PrintHeader from './PrintHeader';

interface RankingsViewProps {
  game: Game;
  tables: RoundTable[];
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

  const relevantTables = roundNumber
    ? tables.filter((table) => table.roundNumber === roundNumber)
    : tables;

  const scoresByPlayer = aggregateScoresFromTables(relevantTables);

  return (
    <Stack gap="md">
      <PrintHeader subtitle={t('pdf:rankings.title')} title={game.name}>
        <Badge color="blue" size="sm" variant="light">
          {roundNumber
            ? `${t('pdf:teamHandout.round')} ${roundNumber}`
            : t('pdf:rankings.total')}
        </Badge>
      </PrintHeader>

      <Stack gap="xs">
        <Title order={3}>{t('common:rankings.teamRankings')}</Title>
        <RankingsTable
          nameLabel={t('common:rankings.team')}
          rankings={mapTeamsToRankings(teams, scoresByPlayer)}
        />
      </Stack>

      <Stack gap="xs">
        <Title order={3}>{t('common:rankings.playerRankings')}</Title>
        <RankingsTable
          showTeamColumn
          nameLabel={t('common:rankings.player')}
          rankings={mapPlayersToRankings(teams, scoresByPlayer)}
        />
      </Stack>
    </Stack>
  );
};

export default RankingsView;
