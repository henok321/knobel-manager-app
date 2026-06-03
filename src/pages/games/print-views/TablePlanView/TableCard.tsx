import { Paper, Stack, Table, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Table as TableType, Team } from '../../../../generated';

interface TableCardProps {
  table: TableType & { roundNumber?: number };
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

export default TableCard;
