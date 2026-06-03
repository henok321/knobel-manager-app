import { Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Table as TableType, Team } from '../../../../generated';
import TableCard from './TableCard';

interface RoundSectionProps {
  roundNumber: number;
  roundTables: (TableType & { roundNumber?: number })[];
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

export default RoundSection;
