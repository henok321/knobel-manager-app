import { Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Game, Table as TableType, Team } from '../../../../generated';
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
