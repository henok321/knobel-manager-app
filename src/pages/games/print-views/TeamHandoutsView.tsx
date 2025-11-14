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

import { Player } from '../../../generated';
import { Table as TableType } from '../../../generated';
import { Game, Team } from '../../../types';

interface TeamHandoutsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
  teamId?: number;
}

const TeamHandoutsView = ({
  game,
  tables,
  players,
  teams: allTeams,
  teamId,
}: TeamHandoutsViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  // Filter teams to display
  const teams = allTeams.filter(
    (team) => team.gameID === game.id && (!teamId || team.id === teamId),
  );

  const renderTeamHandout = (team: Team) => {
    // Get team players
    const teamPlayers = team.players
      .map((playerId: number) => players.find((p) => p.id === playerId))
      .filter((player): player is Player => player !== undefined);

    // Build player assignments per round
    const playerAssignments: Record<
      number,
      Record<number, { tableNumber: number; roundNumber: number }>
    > = {};

    tables.forEach((table) => {
      if (!table.roundNumber) return;

      (table.players || []).forEach((player) => {
        if (team.players.includes(player.id)) {
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
