import { Title, Text, Paper, Table, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Player } from '../../../generated';
import { Table as TableType } from '../../../generated';
import { Game, Team } from '../../../slices/types';

interface TablePlanViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  playersEntities: Record<number, Player | undefined>;
  teamsEntities: Record<number, Team | undefined>;
}

const TablePlanView = ({
  game,
  tables,
  playersEntities: _playersEntities,
  teamsEntities,
}: TablePlanViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  // Group tables by round
  const tablesByRound: Record<number, typeof tables> = {};
  tables.forEach((table) => {
    if (table.roundNumber) {
      tablesByRound[table.roundNumber] ??= [];
      tablesByRound[table.roundNumber]?.push(table);
    }
  });

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
            <div key={roundNumber} className="print-page-break">
              <Stack gap="md">
                <Title order={3}>
                  {t('tablePlan.round')} {roundNumber}
                </Title>

                {roundTables.length === 0 ? (
                  <Text c="dimmed" fs="italic">
                    {t('tablePlan.noTables')}
                  </Text>
                ) : (
                  <div className="tables-grid">
                    {roundTables.map((table) => {
                      const tablePlayers = table.players || [];

                      return (
                        <Paper
                          key={table.id}
                          withBorder
                          className="table-card"
                          p="md"
                        >
                          <Stack gap="xs">
                            <Title order={4} size="h5">
                              {t('tablePlan.table')} {table.tableNumber}
                            </Title>
                            <Table highlightOnHover striped>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>{t('tablePlan.player')}</Table.Th>
                                  <Table.Th>{t('tablePlan.team')}</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {tablePlayers.map((player) => {
                                  const team = teamsEntities[player.teamID];
                                  return (
                                    <Table.Tr key={player.id}>
                                      <Table.Td>{player.name}</Table.Td>
                                      <Table.Td>{team?.name || '-'}</Table.Td>
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
                )}
              </Stack>
            </div>
          );
        },
      )}
    </Stack>
  );
};

export default TablePlanView;
