import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Team } from '../../../store/api.gen.ts';
import type { RoundTable } from '../../../utils/rounds.ts';
import { tableAssignmentsByPlayer } from '../../../utils/tableAssignments.ts';
import PrintHeader from './PrintHeader';
import TeamHandoutCard from './TeamHandoutCard';

interface TeamHandoutsViewProps {
  game: Game;
  tables: RoundTable[];
  teams: Team[];
}

const TeamHandoutsView = ({ game, tables, teams }: TeamHandoutsViewProps) => {
  const { t } = useTranslation();
  const playerTableAssignments = tableAssignmentsByPlayer(tables, game.rounds);

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
          playerTableAssignments={playerTableAssignments}
          team={team}
        />
      ))}
    </Stack>
  );
};

export default TeamHandoutsView;
