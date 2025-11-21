import {
  Title,
  Text,
  Paper,
  Table,
  Stack,
  Divider,
  Badge,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Game, Team } from '../../../generated';

interface TeamHandoutsViewProps {
  game: Game;
  teamId?: number;
}

const TeamHandoutsView = ({ game, teamId }: TeamHandoutsViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  // Get all tables from rounds with roundNumber
  const allTables = (game.rounds || []).flatMap((round) =>
    (round.tables || []).map((table) => ({
      ...table,
      roundNumber: round.roundNumber,
    })),
  );

  // Filter teams to display
  const teams = (game.teams || []).filter(
    (team) => !teamId || team.id === teamId,
  );

  const renderTeamHandout = (team: Team) => {
    // Get team players
    const teamPlayers = team.players || [];
    const teamPlayerIds = teamPlayers.map((p) => p.id);

    // Build player assignments per round
    const playerAssignments: Record<
      number,
      Record<number, { tableNumber: number; roundNumber: number }>
    > = {};

    allTables.forEach((table) => {
      if (!table.roundNumber) return;

      (table.players || []).forEach((player) => {
        if (teamPlayerIds.includes(player.id)) {
          playerAssignments[player.id] ??= {};
          playerAssignments[player.id]![table.roundNumber!] = {
            tableNumber: table.tableNumber,
            roundNumber: table.roundNumber!,
          };
        }
      });
    });

    return (
      <div key={team.id} className="print-page-break">
        <Paper withBorder p="lg">
          <Stack gap="md">
            {/* Team header */}
            <div>
              <Title order={3}>{team.name}</Title>
              <Text c="dimmed" size="sm">
                {game.name}
              </Text>
            </div>

            <Divider />

            {/* Player assignments */}
            <div>
              <Text fw={500} mb="sm">
                {t('teamHandout.assignments')}
              </Text>

              {teamPlayers.map((player) => {
                const assignments = playerAssignments[player.id] || {};

                return (
                  <Paper key={player.id} withBorder mb="md" p="md">
                    <Stack gap="sm">
                      <Text fw={500}>{player.name}</Text>

                      <Table striped withTableBorder>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>{t('teamHandout.round')}</Table.Th>
                            <Table.Th>{t('teamHandout.table')}</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {Array.from(
                            { length: game.numberOfRounds },
                            (_, i) => i + 1,
                          ).map((roundNum) => {
                            const assignment = assignments[roundNum];
                            return (
                              <Table.Tr key={roundNum}>
                                <Table.Td>
                                  {t('teamHandout.round')} {roundNum}
                                </Table.Td>
                                <Table.Td>
                                  {assignment ? (
                                    <Badge color="blue">
                                      {t('teamHandout.table')}{' '}
                                      {assignment.tableNumber}
                                    </Badge>
                                  ) : (
                                    <Text c="dimmed" fs="italic">
                                      {t('teamHandout.notAssigned')}
                                    </Text>
                                  )}
                                </Table.Td>
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </Stack>
                  </Paper>
                );
              })}
            </div>

            {/* Summary */}
            <Divider />
            <div>
              <Text c="dimmed" size="sm">
                {t('teamHandout.summary', {
                  players: teamPlayers.length,
                  rounds: game.numberOfRounds,
                })}
              </Text>
            </div>
          </Stack>
        </Paper>
      </div>
    );
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('teamHandout.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {teamId ? t('teamHandout.subtitleSingle') : t('teamHandout.subtitle')}
        </Text>
      </div>

      {/* Team handouts */}
      {teams.map(renderTeamHandout)}
    </Stack>
  );
};

export default TeamHandoutsView;
