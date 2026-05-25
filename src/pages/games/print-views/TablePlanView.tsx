import { Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Table as TableType, Team } from '../../../slices/types';

interface TablePlanViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
}

type RoundTable = TableType & { roundNumber?: number };

interface TableCardProps {
  table: RoundTable;
  teams: Team[];
}

const TableCard = ({ table, teams }: TableCardProps) => {
  const { t } = useTranslation();
  const tablePlayers = table.players || [];

  return (
    <Paper withBorder className="table-card" p="md">
      <Stack gap="xs">
        <Title order={4} size="h5">
          {t('pdf:tablePlan.table')} {table.tableNumber}
        </Title>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('pdf:tablePlan.player')}</Table.Th>
              <Table.Th>{t('pdf:tablePlan.team')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tablePlayers.map((player) => {
              const team = teams.find((tm) => tm.id === player.teamID);
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
};

interface RoundSectionProps {
  roundNumber: number;
  roundTables: RoundTable[];
  teams: Team[];
}

const RoundSection = ({
  roundNumber,
  roundTables,
  teams,
}: RoundSectionProps) => {
  const { t } = useTranslation();
  const sortedTables = [...roundTables].sort(
    (a, b) => a.tableNumber - b.tableNumber,
  );

  return (
    <div className="print-page-break">
      <Stack gap="md">
        <Title order={3}>
          {t('pdf:tablePlan.round')} {roundNumber}
        </Title>

        {sortedTables.length === 0 ? (
          <Text c="dimmed" fs="italic">
            {t('pdf:tablePlan.noTables')}
          </Text>
        ) : (
          <div className="tables-grid">
            {sortedTables.map((table) => (
              <TableCard key={table.id} table={table} teams={teams} />
            ))}
          </div>
        )}
      </Stack>
    </div>
  );
};

const TablePlanView = ({ game, tables, teams }: TablePlanViewProps) => {
  const { t } = useTranslation();

  const tablesByRound: Record<number, RoundTable[]> = {};
  for (const table of tables) {
    if (table.roundNumber) {
      tablesByRound[table.roundNumber] ??= [];
      tablesByRound[table.roundNumber]?.push(table);
    }
  }

  return (
    <Stack gap="xl">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:tablePlan.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {t('pdf:tablePlan.subtitle')}
        </Text>
      </div>

      {Array.from({ length: game.numberOfRounds }, (_, i) => i + 1).map(
        (roundNumber) => (
          <RoundSection
            key={roundNumber}
            roundNumber={roundNumber}
            roundTables={tablesByRound[roundNumber] || []}
            teams={teams}
          />
        ),
      )}
    </Stack>
  );
};

export default TablePlanView;
