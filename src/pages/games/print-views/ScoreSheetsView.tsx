import { Paper, rem, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Table as TableType, Team } from '../../../slices/types';

interface ScoreSheetsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
}

interface ScoreSheetProps {
  table: TableType & { roundNumber?: number };
  teams: Team[];
  gameName: string;
}

const ScoreSheet = ({ table, teams, gameName }: ScoreSheetProps) => {
  const { t } = useTranslation();
  const tablePlayers = table.players || [];

  return (
    <Paper withBorder className="score-sheet-card" p="sm">
      <Stack gap="xs">
        <div>
          <Title order={3}>
            {t('pdf:scoreSheets.round')} {table.roundNumber}
            {' – '}
            {t('pdf:scoreSheets.table')} {table.tableNumber}
          </Title>
          <Text c="dimmed" size="xs">
            {gameName}
          </Text>
        </div>

        <Table striped withColumnBorders withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('pdf:scoreSheets.player')}</Table.Th>
              <Table.Th>{t('pdf:scoreSheets.team')}</Table.Th>
              <Table.Th style={{ width: rem(80) }}>
                {t('pdf:scoreSheets.score')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tablePlayers.map((player) => {
              const team = teams.find((tm) => tm.id === player.teamID);
              return (
                <Table.Tr key={player.id}>
                  <Table.Td>{player.name}</Table.Td>
                  <Table.Td>{team?.name || '-'}</Table.Td>
                  <Table.Td style={{ height: rem(40) }}>&nbsp;</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        <div className="score-sheet-notes">
          <Text c="dimmed" size="xs">
            {t('pdf:scoreSheets.notes')}
          </Text>
        </div>
      </Stack>
    </Paper>
  );
};

const ScoreSheetsView = ({ game, tables, teams }: ScoreSheetsViewProps) => {
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

      {sortedTables.map((table, index) => (
        <div key={table.id} className="score-sheet-item">
          {index > 0 && <div className="score-sheet-divider" />}
          <ScoreSheet gameName={game.name} table={table} teams={teams} />
        </div>
      ))}
    </Stack>
  );
};

export default ScoreSheetsView;
