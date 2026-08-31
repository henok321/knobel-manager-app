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
import { useLocalStorage } from '@mantine/hooks';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
import { backendErrorMessage, httpStatus } from '../../../../utils/apiError.ts';
import { openConfirmDialog } from '../../../../utils/confirmModal.tsx';
import { buildRoundOptions } from '../../../../utils/rounds.ts';
import RoundTableCard from './RoundTableCard';
import ScoreEntryModal from './ScoreEntryModal';

interface RoundsPanelProps {
  game: Game;
}

const roundTablesErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback: string,
): string | null =>
  error == null || httpStatus(error) === 404
    ? null
    : (backendErrorMessage(error) ?? fallback);

const filterAndSortTables = (tables: Table[], searchQuery: string): Table[] => {
  const query = searchQuery.trim().toLowerCase();
  const matching = query
    ? tables.filter((table) =>
        (table.players ?? []).some((player) =>
          player.name.toLowerCase().includes(query),
        ),
      )
    : tables;

  return [...matching].sort((a, b) => a.tableNumber - b.tableNumber);
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
  const [selectedRound, setSelectedRound] = useLocalStorage<number>({
    key: `selected_round_for_game_${game.id}`,
    defaultValue: 1,
    getInitialValueInEffect: false,
  });

  const runMatchmaking = async (mutate: () => Promise<unknown>) => {
    setError(null);

    try {
      await mutate();
    } catch (err) {
      setError(backendErrorMessage(err) ?? t('gameDetail:rounds.error'));
    }
  };

  const startMatchmaking = () =>
    void runMatchmaking(() => setupGame({ gameId: game.id }).unwrap());

  const confirmReset = () =>
    openConfirmDialog({
      modalId: 'reset-matchmaking',
      title: t('gameDetail:rounds.resetMatchmaking'),
      message: t('gameDetail:rounds.confirmResetMatchmaking'),
      confirmLabel: t('gameDetail:rounds.resetMatchmaking'),
      onConfirm: () =>
        void runMatchmaking(() => resetSetup({ gameId: game.id }).unwrap()),
    });

  const canEditScores = game.status === 'in_progress';
  const canSetupMatchmaking = game.status === 'setup';
  const hasRounds = (game.rounds?.length || 0) > 0;
  const isSetupMode = !hasRounds || allTables.length === 0;
  const sufficientTeams = teams.length >= game.tableSize;

  const {
    data: roundTablesData,
    isFetching: loading,
    error: roundTablesError,
  } = useGetTablesQuery(
    { gameId: game.id, roundNumber: selectedRound },
    { skip: isSetupMode },
  );
  const roundTables = roundTablesData?.tables ?? [];

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
        roundNumber: selectedRound,
        tableNumber: selectedTable.tableNumber,
        scoresRequest: { scores },
      }).unwrap();
    } catch (err) {
      setError(backendErrorMessage(err) ?? t('common:actions.errorOccurred'));
      throw err;
    }
  };

  const displayError =
    error ||
    roundTablesErrorMessage(roundTablesError, t('gameDetail:rounds.error'));

  const roundsContent = () => {
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
            disabled={!sufficientTeams}
            size="lg"
            onClick={startMatchmaking}
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

    const visibleTables = filterAndSortTables(roundTables, searchQuery);

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
            onEditScores={(tableToEdit) => {
              setSelectedTable(tableToEdit);
              setScoreModalOpen(true);
            }}
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
            data={buildRoundOptions(t, game.numberOfRounds)}
            label={t('gameDetail:rounds.selectRound')}
            style={{ width: 200 }}
            value={String(selectedRound)}
            onChange={(value) => setSelectedRound(Number(value) || 1)}
          />
          {canSetupMatchmaking && (
            <Group gap="xs">
              <Button
                disabled={!sufficientTeams || resetting}
                loading={settingUp}
                size="md"
                variant="light"
                onClick={startMatchmaking}
              >
                {t('gameDetail:rounds.rerunMatchmaking')}
              </Button>
              <Button
                color="red"
                disabled={settingUp}
                loading={resetting}
                size="md"
                variant="light"
                onClick={confirmReset}
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

      {roundsContent()}

      <ScoreEntryModal
        isOpen={scoreModalOpen}
        roundNumber={selectedRound}
        table={selectedTable}
        teams={teams}
        onClose={() => setScoreModalOpen(false)}
        onSubmit={handleSubmitScores}
      />
    </Stack>
  );
};

export default RoundsPanel;
