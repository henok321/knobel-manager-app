import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import PrintHeader from '../PrintHeader';
import TeamHandoutCard from './TeamHandoutCard';

interface TeamHandoutsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
  teamID?: number;
}

const TeamHandoutsView = ({
  game,
  tables,
  teams,
  teamID,
}: TeamHandoutsViewProps) => {
  const { t } = useTranslation();

  const filteredTeams = teamID
    ? teams.filter((team) => team.id === teamID)
    : teams;

  return (
    <Stack gap="md">
      <PrintHeader subtitle={t('pdf:teamHandout.title')} title={game.name}>
        <Text c="dimmed" size="sm">
          {teamID
            ? t('pdf:teamHandout.subtitleSingle')
            : t('pdf:teamHandout.subtitle')}
        </Text>
      </PrintHeader>

      {filteredTeams.map((team) => (
        <TeamHandoutCard
          key={team.id}
          gameName={game.name}
          numberOfRounds={game.numberOfRounds}
          tables={tables}
          team={team}
        />
      ))}
    </Stack>
  );
};

export default TeamHandoutsView;
