import { Title, Text, Paper, Table, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Table as TableType, Player, Game, Team } from '../../../slices/types';

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
  const { t } = useTranslation();

  const sortedTables = [...tables].sort((a, b) => {
    if (a.roundNumber && b.roundNumber && a.roundNumber !== b.roundNumber) {
      return a.roundNumber - b.roundNumber;
    }
    return a.tableNumber - b.tableNumber;
  });

  return (
    <Stack gap={0}>
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:scoreSheets.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {t('pdf:scoreSheets.instructions')}
        </Text>
      </div>

      {sortedTables.map((table, index) => {
        const tablePlayers = table.players || [];
        return (
          <div key={table.id} className="score-sheet-item">
            {index > 0 && <div className="score-sheet-divider" />}
            <Paper withBorder className="score-sheet-card" p="sm">
              <Stack gap="xs">
                <div>
                  <Title order={3}>
                    {t('pdf:scoreSheets.round')} {table.roundNumber}
                    {' – '}
                    {t('pdf:scoreSheets.table')} {table.tableNumber}
                  </Title>
                  <Text c="dimmed" size="xs">
                    {game.name}
                  </Text>
                </div>

                <Table striped withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('pdf:scoreSheets.player')}</Table.Th>
                      <Table.Th>{t('pdf:scoreSheets.team')}</Table.Th>
                      <Table.Th style={{ width: '80px' }}>
                        {t('pdf:scoreSheets.score')}
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

                <div
                  style={{
                    borderTop: '1px solid #dee2e6',
                    paddingTop: '4px',
                    minHeight: '80px',
                  }}
                >
                  <Text c="dimmed" size="xs">
                    {t('pdf:scoreSheets.notes')}
                  </Text>
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
