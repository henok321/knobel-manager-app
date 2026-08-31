import {
  Alert,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetGameTablesQuery,
  useGetTablesQuery,
  useUpdateScoresMutation,
} from '../../../../store/api';
import type { Game, Table } from '../../../../store/api.gen.ts';
import { backendErrorMessage } from '../../../../utils/backendErrorMessage.ts';
import { buildRoundOptions } from '../roundOptions.ts';
import RoundsContent from './RoundsContent';
import { roundTablesErrorMessage } from './roundTables.ts';
import ScoreEntryModal from './ScoreEntryModal';
import { useMatchmaking } from './useMatchmaking';

interface RoundsPanelProps {
  game: Game;
}

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation();
  const [updateScores] = useUpdateScoresMutation();
  const teams = game.teams ?? [];
  const { data: allTablesData } = useGetGameTablesQuery({ gameId: game.id });
  const allTables = allTablesData?.tables ?? [];

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { settingUp, resetting, startMatchmaking, resetMatchmaking } =
    useMatchmaking(game.id, setError, t('gameDetail:rounds.error'));

  const confirmReset = () =>
    modals.openConfirmModal({
      modalId: 'reset-matchmaking',
      title: t('gameDetail:rounds.resetMatchmaking'),
      children: (
        <Text size="sm">{t('gameDetail:rounds.confirmResetMatchmaking')}</Text>
      ),
      labels: {
        confirm: t('gameDetail:rounds.resetMatchmaking'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: resetMatchmaking,
    });

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
      setError(backendErrorMessage(err) ?? t('common:actions.errorOccurred'));
      throw err;
    }
  };

  const displayError =
    error ||
    roundTablesErrorMessage(
      roundTablesIsError,
      roundTablesError,
      t('gameDetail:rounds.error'),
    );

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
                disabled={!sufficientTeams || resetting}
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

      <RoundsContent
        canEditScores={canEditScores}
        canSetupMatchmaking={canSetupMatchmaking}
        displayError={displayError}
        isSetupMode={isSetupMode}
        loading={loading}
        searchQuery={searchQuery}
        settingUp={settingUp}
        sufficientTeams={sufficientTeams}
        tables={roundTables}
        teams={teams}
        onEditScores={handleOpenScoreEntry}
        onSetupGame={startMatchmaking}
      />

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
