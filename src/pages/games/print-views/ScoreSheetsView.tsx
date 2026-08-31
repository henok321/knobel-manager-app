import { Paper, rem, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Team } from '../../../store/api.gen.ts';
import type { RoundTable } from '../../../utils/rounds.ts';
import PrintHeader from './PrintHeader';

interface ScoreSheetsViewProps {
  game: Game;
  tables: RoundTable[];
  teams: Team[];
}

const ScoreSheet = ({
  table,
  teams,
  gameName,
}: {
  table: RoundTable;
  teams: Team[];
  gameName: string;
}) => {
  const { t } = useTranslation();

  return (
    <Paper withBorder className="score-sheet-card" p="sm">
      <Stack gap="xs">
        <div>
          <Title order={3}>
            {t('pdf:scoreSheets.heading', {
              round: table.roundNumber,
              table: table.tableNumber,
            })}
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
            {(table.players ?? []).map((player) => (
              <Table.Tr key={player.id}>
                <Table.Td>{player.name}</Table.Td>
                <Table.Td>
                  {teams.find((team) => team.id === player.teamID)?.name || '-'}
                </Table.Td>
                <Table.Td style={{ height: rem(40) }}>&nbsp;</Table.Td>
              </Table.Tr>
            ))}
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

  const sortedTables = [...tables].sort(
    (a, b) =>
      (a.roundNumber ?? 0) - (b.roundNumber ?? 0) ||
      a.tableNumber - b.tableNumber,
  );

  return (
    <Stack gap={0}>
      <PrintHeader subtitle={t('pdf:scoreSheets.title')} title={game.name}>
        <Text c="dimmed" size="sm">
          {t('pdf:scoreSheets.instructions')}
        </Text>
      </PrintHeader>

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
