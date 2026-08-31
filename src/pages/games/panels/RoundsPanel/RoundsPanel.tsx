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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '../../../../shared/EmptyStateCard';
import {
  useGetGameTablesQuery,
  useGetTablesQuery,
  useResetGameSetupMutation,
  useSetupGameMutation,
  useUpdateScoresMutation,
} from '../../../../store/api';
import type { Game, Table } from '../../../../store/api.gen.ts';
import { openResetMatchmakingModal } from '../resetMatchmakingModal.tsx';
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

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation();
  const [setupGame, { isLoading: settingUp }] = useSetupGameMutation();
  const [resetSetup, { isLoading: resetting }] = useResetGameSetupMutation();
  const [updateScores] = useUpdateScoresMutation();
  const teams = game.teams ?? [];
  const { data: allTablesData } = useGetGameTablesQuery({ gameId: game.id });
  const allTables = allTablesData?.tables ?? [];

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canEditScores = game.status === 'in_progress';
  const canSetupMatchmaking = game.status === 'setup';
  const hasRounds = (game.rounds?.length || 0) > 0;
  const isSetupMode = !hasRounds || allTables.length === 0;

  const roundOptions = buildRoundOptions(t, game.numberOfRounds);

  const roundStorageKey = `selected_round_for_game_${game.id}`;
  const [selectedRound, setSelectedRound] = useState<number>(
    () => Number(localStorage.getItem(roundStorageKey)) || 1,
  );

  const sufficientTeams = teams.length >= game.tableSize;

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

  const handleResetSetup = () =>
    openResetMatchmakingModal(t, async () => {
      setError(null);

      try {
        await resetSetup({ gameId: game.id }).unwrap();
      } catch (err) {
        setError(getBackendErrorMessage(err) ?? t('gameDetail:rounds.error'));
      }
    });

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
    roundTablesError != null &&
    'status' in roundTablesError &&
    roundTablesError.status === 404;
  const displayError =
    error ||
    (roundTablesIsError && !isNotFound
      ? (getBackendErrorMessage(roundTablesError) ??
        t('gameDetail:rounds.error'))
      : null);

  const renderContent = () => {
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
            onClick={() => void handleSetupGame()}
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
    if (roundTables.length === 0) {
      return displayError ? null : (
        <Card padding="lg">
          <Text c="dimmed" ta="center">
            {t('gameDetail:rounds.noTables')}
          </Text>
        </Card>
      );
    }
    if (filteredAndSortedTables.length === 0) {
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
            onChange={(value) => {
              const round = Number(value || 1);
              setSelectedRound(round);
              localStorage.setItem(roundStorageKey, String(round));
            }}
          />
          {canSetupMatchmaking && (
            <Group gap="xs">
              <Button
                loading={settingUp}
                size="md"
                disabled={!sufficientTeams}
                variant="light"
                onClick={() => void handleSetupGame()}
              >
                {t('gameDetail:rounds.rerunMatchmaking')}
              </Button>
              <Button
                color="red"
                loading={resetting}
                size="md"
                variant="light"
                onClick={handleResetSetup}
              >
                {t('gameDetail:rounds.resetMatchmaking')}
              </Button>
            </Group>
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
