import { Title, Text, Paper, Table, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Game } from '../../../generated';

interface TablePlanViewProps {
  game: Game;
}

const TablePlanView = ({ game }: TablePlanViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  // Get all tables from rounds with roundNumber
  const allTables = (game.rounds || []).flatMap((round) =>
    (round.tables || []).map((table) => ({
      ...table,
      roundNumber: round.roundNumber,
    })),
  );

  // Group tables by round
  const tablesByRound: Record<number, typeof allTables> = {};
  allTables.forEach((table) => {
    tablesByRound[table.roundNumber] ??= [];
    tablesByRound[table.roundNumber]?.push(table);
  });

  const teams = game.teams || [];

  return (
    <Stack gap="xl">
      {/* Header */}
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('tablePlan.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {t('tablePlan.subtitle')}
        </Text>
      </div>

      {/* Round by round */}
      {Array.from({ length: game.numberOfRounds }, (_, i) => i + 1).map(
        (roundNumber) => {
          const roundTables = (tablesByRound[roundNumber] || []).sort(
            (a, b) => a.tableNumber - b.tableNumber,
          );

          return (
            <Paper
              key={roundNumber}
              withBorder
              className="print-page-break"
              p="md"
            >
              <Stack gap="md">
                <Title order={3}>
                  {t('tablePlan.roundTitle', { round: roundNumber })}
                </Title>

                {roundTables.map((table) => {
                  const tablePlayers = table.players || [];

                  return (
                    <div key={table.id}>
                      <Text fw={600} size="lg">
                        {t('tablePlan.tableNumber', {
                          number: table.tableNumber,
                        })}
                      </Text>
                      <Table striped>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>{t('tablePlan.player')}</Table.Th>
                            <Table.Th>{t('tablePlan.team')}</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {tablePlayers.map((player) => {
                            const team = teams.find(
                              (t) => t.id === player.teamID,
                            );
                            return (
                              <Table.Tr key={player.id}>
                                <Table.Td>{player.name}</Table.Td>
                                <Table.Td>{team?.name || '-'}</Table.Td>
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </div>
                  );
                })}
              </Stack>
            </Paper>
          );
        },
      )}
    </Stack>
  );
};

export default TablePlanView;
