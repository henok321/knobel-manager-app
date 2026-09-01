import { Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Team } from '../../../store/api.gen.ts';
import { type RoundTable, roundSequence } from '../../../utils/rounds.ts';
import PrintHeader from './PrintHeader';

interface TablePlanViewProps {
  game: Game;
  tables: RoundTable[];
  teams: Team[];
}

const TableCard = ({ table, teams }: { table: RoundTable; teams: Team[] }) => {
  const { t } = useTranslation();

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
            {(table.players ?? []).map((player) => (
              <Table.Tr key={player.id}>
                <Table.Td>{player.name}</Table.Td>
                <Table.Td>
                  {teams.find((team) => team.id === player.teamID)?.name || '-'}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
};

const RoundSection = ({
  roundNumber,
  roundTables,
  teams,
}: {
  roundNumber: number;
  roundTables: RoundTable[];
  teams: Team[];
}) => {
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

  return (
    <Stack gap="xl">
      <PrintHeader subtitle={t('pdf:tablePlan.title')} title={game.name}>
        <Text c="dimmed" size="sm">
          {t('pdf:tablePlan.subtitle')}
        </Text>
      </PrintHeader>

      {roundSequence(game.numberOfRounds).map((roundNumber) => (
        <RoundSection
          key={roundNumber}
          roundNumber={roundNumber}
          roundTables={tables.filter(
            (table) => table.roundNumber === roundNumber,
          )}
          teams={teams}
        />
      ))}
    </Stack>
  );
};

export default TablePlanView;
