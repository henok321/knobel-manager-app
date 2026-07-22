import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import PrintHeader from '../PrintHeader';
import RoundSection from './RoundSection';

interface TablePlanViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  teams: Team[];
}

type RoundTable = TableType & { roundNumber?: number };

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
      <PrintHeader subtitle={t('pdf:tablePlan.title')} title={game.name}>
        <Text c="dimmed" size="sm">
          {t('pdf:tablePlan.subtitle')}
        </Text>
      </PrintHeader>

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
