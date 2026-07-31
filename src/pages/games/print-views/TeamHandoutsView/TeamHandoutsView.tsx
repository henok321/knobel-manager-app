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
}

const TeamHandoutsView = ({ game, tables, teams }: TeamHandoutsViewProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <PrintHeader subtitle={t('pdf:teamHandout.title')} title={game.name}>
        <Text c="dimmed" size="sm">
          {t('pdf:teamHandout.subtitle')}
        </Text>
      </PrintHeader>

      {teams.map((team) => (
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
