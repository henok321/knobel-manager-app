import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '../../../../shared/EmptyStateCard';
import {
  useGetGameTablesQuery,
  useGetTablesQuery,
  useSetupGameMutation,
  useUpdateScoresMutation,
} from '../../../../store/api';
import type {
  Game,
  GameStatus,
  Table,
} from '../../../../store/generatedApi.ts';
import { assertNever } from '../../../../utils/assertNever';
import { buildRoundOptions } from '../roundOptions.ts';
import RoundTableCard from './RoundTableCard';
import ScoreEntryModal from './ScoreEntryModal';

interface RoundsPanelProps {
  game: Game;
}

const getBackendErrorMessage = (err: unknown): string | undefined => {
  const data = (err as { data?: { error?: unknown } })?.data;
  if (typeof data?.error === 'string') return data.error;
  return err instanceof Error ? err.message : undefined;
};

interface RoundsPermissions {
  canEditScores: boolean;
  canSetupMatchmaking: boolean;
}

const getRoundsPermissions = (status: GameStatus): RoundsPermissions => {
  switch (status) {
    case 'setup':
      return { canEditScores: false, canSetupMatchmaking: true };
    case 'in_progress':
      return { canEditScores: true, canSetupMatchmaking: false };
    case 'completed':
      return { canEditScores: false, canSetupMatchmaking: false };
    default:
      return assertNever(status);
  }
};

type RoundsView =
  | 'loading'
  | 'setup'
  | 'setup-unavailable'
  | 'empty'
  | 'no-results'
  | 'tables'
  | 'none';

interface RoundsViewInput {
  loading: boolean;
  settingUp: boolean;
  isSetupMode: boolean;
  canSetupMatchmaking: boolean;
  hasError: boolean;
  roundTablesCount: number;
  filteredCount: number;
  hasSearchQuery: boolean;
}

const getRoundsView = ({
  loading,
  settingUp,
  isSetupMode,
  canSetupMatchmaking,
  hasError,
  roundTablesCount,
  filteredCount,
  hasSearchQuery,
}: RoundsViewInput): RoundsView => {
  if (loading || settingUp) return 'loading';
  if (isSetupMode) return canSetupMatchmaking ? 'setup' : 'setup-unavailable';
  if (roundTablesCount === 0) return hasError ? 'none' : 'empty';
  if (filteredCount === 0 && hasSearchQuery) return 'no-results';
  return 'tables';
};

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation();
  const [setupGame, { isLoading: settingUp }] = useSetupGameMutation();
  const [updateScores] = useUpdateScoresMutation();
  const teams = game.teams ?? [];
  const { data: allTablesData } = useGetGameTablesQuery({ gameId: game.id });
  const allTables = allTablesData?.tables ?? [];

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { canEditScores, canSetupMatchmaking } = getRoundsPermissions(
    game.status,
  );
  const hasRounds = (game.rounds?.length || 0) > 0;
  const isSetupMode = !hasRounds || allTables.length === 0;

  const roundOptions = buildRoundOptions(t, game.numberOfRounds);

  const getPersistedRound = () => {
    const stored = localStorage.getItem(`selected_round_for_game_${game.id}`);
    return Number(stored) || 1;
  };

  const [selectedRound, setSelectedRound] = useState<number>(
    getPersistedRound(),
  );

  const sufficientTeams = teams.length >= game.tableSize;

  useEffect(() => {
    localStorage.setItem(
      `selected_round_for_game_${game.id}`,
      `${selectedRound}`,
    );
  }, [selectedRound, game.id]);

  const {
    data: roundTablesData,
    isFetching: loading,
    isError: roundTablesIsError,
    error: roundTablesError,
  } = useGetTablesQuery(
    { gameId: game.id, roundNumber: Number(selectedRound) },
    { skip: isSetupMode },
  );
  const roundTables = roundTablesData?.tables ?? [];

  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? roundTables.filter((table) =>
        (table.players ?? []).some((player) =>
          player.name.toLowerCase().includes(query),
        ),
      )
    : roundTables;
  const filteredAndSortedTables = [...filtered].sort(
    (a, b) => a.tableNumber - b.tableNumber,
  );

  const handleSetupGame = async () => {
    setError(null);

    try {
      await setupGame({ gameId: game.id }).unwrap();
    } catch (err) {
      setError(getBackendErrorMessage(err) ?? t('gameDetail:rounds.error'));
    }
  };

  const handleOpenScoreEntry = (table: Table) => {
    setSelectedTable(table);
    setScoreModalOpen(true);
  };

  const handleSubmitScores = async (
    scores: { playerID: number; score: number }[],
  ) => {
    if (!selectedTable) {
      return;
    }
    setError(null);

    try {
      await updateScores({
        gameId: game.id,
        roundNumber: Number(selectedRound),
        tableNumber: selectedTable.tableNumber,
        scoresRequest: { scores },
      }).unwrap();
    } catch (err) {
      setError(
        getBackendErrorMessage(err) ?? t('common:actions.errorOccurred'),
      );
      throw err;
    }
  };

  const isNotFound =
    roundTablesIsError &&
    typeof roundTablesError === 'object' &&
    roundTablesError !== null &&
    'status' in roundTablesError &&
    roundTablesError.status === 404;
  const displayError =
    error ||
    (roundTablesIsError && !isNotFound
      ? (getBackendErrorMessage(roundTablesError) ??
        t('gameDetail:rounds.error'))
      : null);

  const view = getRoundsView({
    loading,
    settingUp,
    isSetupMode,
    canSetupMatchmaking,
    hasError: Boolean(displayError),
    roundTablesCount: roundTables.length,
    filteredCount: filteredAndSortedTables.length,
    hasSearchQuery: Boolean(searchQuery.trim()),
  });

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return (
          <Text c="dimmed" ta="center">
            {settingUp
              ? t('gameDetail:rounds.generatingTables')
              : t('common:actions.loading')}
          </Text>
        );
      case 'setup':
        return (
          <EmptyStateCard
            description={t('gameDetail:rounds.setupDescription')}
            title={t('gameDetail:rounds.setupRequired')}
          >
            <Button
              loading={settingUp}
              disabled={!sufficientTeams}
              size="lg"
              onClick={() => void handleSetupGame()}
            >
              {t('gameDetail:rounds.setupMatchmaking')}
            </Button>
          </EmptyStateCard>
        );
      case 'setup-unavailable':
        return (
          <EmptyStateCard
            description={t('gameDetail:rounds.setupNotAvailableDescription')}
            title={t('gameDetail:rounds.setupNotAvailable')}
          />
        );
      case 'empty':
        return (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('gameDetail:rounds.noTables')}
            </Text>
          </Card>
        );
      case 'no-results':
        return (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('gameDetail:rounds.noSearchResults')}
            </Text>
          </Card>
        );
      case 'tables':
        return (
          <Stack gap="md">
            {filteredAndSortedTables.map((table) => (
              <RoundTableCard
                key={table.id}
                canEditScores={canEditScores}
                table={table}
                teams={teams}
                onEditScores={handleOpenScoreEntry}
              />
            ))}
          </Stack>
        );
      case 'none':
        return null;
      default:
        return assertNever(view);
    }
  };

  return (
    <Stack gap="md">
      {(!isSetupMode || game.status === 'in_progress') && (
        <Group align="flex-end" justify="space-between" wrap="wrap">
          <TextInput
            placeholder={t('gameDetail:rounds.searchPlayers')}
            style={{ width: 250 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            data={roundOptions}
            label={t('gameDetail:rounds.selectRound')}
            style={{ width: 200 }}
            value={`${selectedRound}`}
            onChange={(value) => setSelectedRound(Number(value || 1))}
          />
          {canSetupMatchmaking && (
            <Button
              loading={settingUp}
              size="md"
              disabled={!sufficientTeams}
              variant="light"
              onClick={() => void handleSetupGame()}
            >
              {t('gameDetail:rounds.rerunMatchmaking')}
            </Button>
          )}
        </Group>
      )}

      {displayError && (
        <Alert color="red" title={t('common:actions.error')}>
          {displayError}
        </Alert>
      )}

      {renderContent()}

      <ScoreEntryModal
        isOpen={scoreModalOpen}
        roundNumber={Number(selectedRound)}
        table={selectedTable}
        teams={teams}
        onClose={() => setScoreModalOpen(false)}
        onSubmit={handleSubmitScores}
      />
    </Stack>
  );
};

export default RoundsPanel;
