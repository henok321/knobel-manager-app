import { Button, Card, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '../../../../shared/EmptyStateCard';
import type { Table, Team } from '../../../../store/api.gen.ts';
import RoundTableCard from './RoundTableCard';
import { filterAndSortTables } from './roundTables.ts';

interface RoundsContentProps {
  canEditScores: boolean;
  canSetupMatchmaking: boolean;
  displayError: string | null;
  isSetupMode: boolean;
  loading: boolean;
  searchQuery: string;
  settingUp: boolean;
  sufficientTeams: boolean;
  tables: Table[];
  teams: Team[];
  onEditScores: (table: Table) => void;
  onSetupGame: () => void;
}

const RoundsContent = ({
  canEditScores,
  canSetupMatchmaking,
  displayError,
  isSetupMode,
  loading,
  searchQuery,
  settingUp,
  sufficientTeams,
  tables,
  teams,
  onEditScores,
  onSetupGame,
}: RoundsContentProps) => {
  const { t } = useTranslation();

  if (loading || settingUp) {
    return (
      <Text c="dimmed" ta="center">
        {settingUp
          ? t('gameDetail:rounds.generatingTables')
          : t('common:actions.loading')}
      </Text>
    );
  }

  if (isSetupMode) {
    return canSetupMatchmaking ? (
      <EmptyStateCard
        description={t('gameDetail:rounds.setupDescription')}
        title={t('gameDetail:rounds.setupRequired')}
      >
        <Button
          loading={settingUp}
          disabled={!sufficientTeams}
          size="lg"
          onClick={onSetupGame}
        >
          {t('gameDetail:rounds.setupMatchmaking')}
        </Button>
      </EmptyStateCard>
    ) : (
      <EmptyStateCard
        description={t('gameDetail:rounds.setupNotAvailableDescription')}
        title={t('gameDetail:rounds.setupNotAvailable')}
      />
    );
  }

  if (tables.length === 0) {
    return displayError ? null : (
      <Card padding="lg">
        <Text c="dimmed" ta="center">
          {t('gameDetail:rounds.noTables')}
        </Text>
      </Card>
    );
  }

  const visibleTables = filterAndSortTables(tables, searchQuery);

  if (visibleTables.length === 0) {
    return (
      <Card padding="lg">
        <Text c="dimmed" ta="center">
          {t('gameDetail:rounds.noSearchResults')}
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {visibleTables.map((table) => (
        <RoundTableCard
          key={table.id}
          canEditScores={canEditScores}
          table={table}
          teams={teams}
          onEditScores={onEditScores}
        />
      ))}
    </Stack>
  );
};

export default RoundsContent;
