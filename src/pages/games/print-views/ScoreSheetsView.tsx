import { Title, Text, Paper, Table, Stack, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Player } from '../../../generated';
import { Table as TableType } from '../../../generated';
import { Game, Team } from '../../../types';

interface ScoreSheetsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
}

const ScoreSheetsView = ({
  game,
  tables,
  players: _players,
  teams,
}: ScoreSheetsViewProps) => {
  const { t } = useTranslation(['pdf', 'common']);

  // Sort tables by round and table number
  const sortedTables = [...tables].sort((a, b) => {
    if (a.roundNumber && b.roundNumber && a.roundNumber !== b.roundNumber) {
      return a.roundNumber - b.roundNumber;
    }
    return a.tableNumber - b.tableNumber;
  });

  return (
    <Stack gap="xl">
      {/* Header */}
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('scoreSheets.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {t('scoreSheets.subtitle')}
        </Text>
      </div>

      {/* One page per table */}
      {sortedTables.map((table) => {
        const tablePlayers = table.players || [];

        return (
          <div key={table.id} className="print-page-break">
            <Paper withBorder p="lg">
              <Stack gap="md">
                {/* Sheet header */}
                <div>
                  <Title order={3}>
                    {t('scoreSheets.round')} {table.roundNumber} -{' '}
                    {t('scoreSheets.table')} {table.tableNumber}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {game.name}
                  </Text>
                </div>

                <Divider />

                {/* Instructions */}
                <Text fw={500} size="sm">
                  {t('scoreSheets.instructions')}
                </Text>

                {/* Score table */}
                <Table striped withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('scoreSheets.player')}</Table.Th>
                      <Table.Th>{t('scoreSheets.team')}</Table.Th>
                      <Table.Th style={{ width: '120px' }}>
                        {t('scoreSheets.score')}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {tablePlayers.map((player) => {
                      const team = teams.find((t) => t.id === player.teamID);
                      return (
                        <Table.Tr key={player.id}>
                          <Table.Td>{player.name}</Table.Td>
                          <Table.Td>{team?.name || '-'}</Table.Td>
                          <Table.Td style={{ height: '40px' }}>&nbsp;</Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>

                <Divider />

                {/* Notes section */}
                <div>
                  <Text fw={500} mb="xs">
                    {t('scoreSheets.notes')}
                  </Text>
                  <Paper withBorder p="md" style={{ minHeight: '100px' }}>
                    <Text c="dimmed" size="sm">
                      {t('scoreSheets.notesPlaceholder')}
                    </Text>
                  </Paper>
                </div>
              </Stack>
            </Paper>
          </div>
        );
      })}
    </Stack>
  );
};

export default ScoreSheetsView;
