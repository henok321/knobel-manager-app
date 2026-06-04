import { Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import ScoreSheet from './ScoreSheet';

interface ScoreSheetsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
}

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
