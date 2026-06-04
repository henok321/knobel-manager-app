import { Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Player,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import TeamHandoutCard from './TeamHandoutCard';

interface TeamHandoutsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
  teamID?: number;
}

const TeamHandoutsView = ({
  game,
  tables,
  players,
  teams,
  teamID,
}: TeamHandoutsViewProps) => {
  const { t } = useTranslation();

  const filteredTeams = teamID
    ? teams.filter((team) => team.id === teamID)
    : teams;

  return (
    <Stack gap="md">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:teamHandout.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {teamID
            ? t('pdf:teamHandout.subtitleSingle')
            : t('pdf:teamHandout.subtitle')}
        </Text>
      </div>

      {filteredTeams.map((team) => (
        <TeamHandoutCard
          key={team.id}
          gameName={game.name}
          numberOfRounds={game.numberOfRounds}
          players={players}
          tables={tables}
          team={team}
        />
      ))}
    </Stack>
  );
};

export default TeamHandoutsView;
