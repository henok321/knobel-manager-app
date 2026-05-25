import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Table as MantineTable,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import EmptyStateCard from '../../../shared/EmptyStateCard';
import Icon from '../../../shared/Icon';

import useGames from '../../../slices/games/hooks';
import useTables, {
  useGameTablesFetch,
  useTablesByGameId,
} from '../../../slices/tables/hooks';
import { selectTablesForRoundWithSearch } from '../../../slices/tables/slice';
import { useTeamsByGameId } from '../../../slices/teams/hooks';
import type { Game, GameStatus, Table, Team } from '../../../slices/types';
import type { RootState } from '../../../store/store';
import { assertNever } from '../../../utils/assertNever';
import { PlayerScoreRow } from '../components/PlayerScoreRow';
import ScoreEntryModal from '../components/ScoreEntryModal';
import { buildRoundOptions } from './roundOptions.ts';

interface RoundsPanelProps {
  game: Game;
}

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

interface RoundTableCardProps {
  table: Table;
  teams: Team[];
  canEditScores: boolean;
  onEditScores: (table: Table) => void;
}

const RoundTableCard = ({
  table,
  teams,
  canEditScores,
  onEditScores,
}: RoundTableCardProps) => {
  const { t } = useTranslation();
  const hasScores = (table.scores?.length ?? 0) > 0;

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Group align="center" justify="space-between">
          <Group gap="xs">
            <Title order={4}>
              {`${t('gameDetail:rounds.table')} ${table.tableNumber}`}
            </Title>
            {hasScores ? (
              <Badge
                color="green"
                leftSection={<Icon icon={IconCheck} size={14} />}
                variant="light"
              >
                {t('gameDetail:rounds.scoresEntered')}
              </Badge>
            ) : (
              <Badge
                color="gray"
                leftSection={<Icon icon={IconClock} size={14} />}
                variant="light"
              >
                {t('gameDetail:rounds.scoresPending')}
              </Badge>
            )}
          </Group>
          {canEditScores && (
            <Button
              size="sm"
              variant="light"
              onClick={() => onEditScores(table)}
            >
              {hasScores
                ? t('gameDetail:rounds.editScores')
                : t('gameDetail:rounds.enterScores')}
            </Button>
          )}
        </Group>

        <MantineTable
          className="rounds-table"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <colgroup>
            <col style={{ width: '50%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <MantineTable.Thead>
            <MantineTable.Tr>
              <MantineTable.Th>{t('gameDetail:rounds.player')}</MantineTable.Th>
              <MantineTable.Th>{t('gameDetail:rounds.team')}</MantineTable.Th>
              <MantineTable.Th>{t('gameDetail:rounds.score')}</MantineTable.Th>
            </MantineTable.Tr>
          </MantineTable.Thead>
          <MantineTable.Tbody>
            {table.players?.map((player) => {
              const playerScore = table.scores?.find(
                (s) => s.playerID === player.id,
              );
              const team = player.teamID
                ? teams.find((tm) => tm.id === player.teamID)
                : undefined;
              return (
                <PlayerScoreRow
                  key={player.id}
                  player={player}
                  score={playerScore}
                  team={team}
                />
              );
            })}
          </MantineTable.Tbody>
        </MantineTable>
      </Stack>
    </Card>
  );
};

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation();
  const { setupGame, status: gamesStatus } = useGames();
  const teams = useTeamsByGameId(game.id);
  const tables = useTablesByGameId(game.id);
  const {
    status: tablesStatus,
    error: tablesError,
    fetchAllTables,
    updateScores,
  } = useTables();

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { canEditScores, canSetupMatchmaking } = getRoundsPermissions(
    game.status,
  );
  const hasRounds = (game.rounds?.length || 0) > 0;
  const isSetupMode = !hasRounds || tables.length === 0;

  const roundOptions = useMemo(
    () => buildRoundOptions(t, game.numberOfRounds),
    [t, game.numberOfRounds],
  );

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

  const filteredAndSortedTables = useSelector((state: RootState) =>
    selectTablesForRoundWithSearch(
      state,
      game.id,
      Number(selectedRound),
      searchQuery,
    ),
  );

  useGameTablesFetch(game.id, game.numberOfRounds, hasRounds);

  const handleSetupGame = async () => {
    setError(null);

    try {
      await setupGame(game.id);
      fetchAllTables(game.id, game.numberOfRounds);
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error).message ||
        t('gameDetail:rounds.error');
      setError(errorMessage);
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
      await updateScores(
        game.id,
        Number(selectedRound),
        selectedTable.tableNumber,
        scores,
      ).unwrap();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('common:actions.errorOccurred'),
      );
      throw err;
    }
  };

  const settingUp = gamesStatus === 'pending';
  const loading = tablesStatus === 'pending';
  const displayError =
    error ||
    (tablesStatus === 'failed' && !tablesError?.includes('404')
      ? tablesError
      : null);

  return (
    <Stack gap="md">
      <style>{`
        .rounds-table tbody tr > td:nth-child(2),
        .rounds-table thead tr > th:nth-child(2) { text-align: center; }
        .rounds-table tbody tr > td:nth-child(3),
        .rounds-table thead tr > th:nth-child(3) { text-align: right; }
      `}</style>
      {(!isSetupMode || game.status === 'in_progress') && (
        <Group align="flex-end" justify="space-between" wrap="wrap">
          <Select
            data={roundOptions}
            label={t('gameDetail:rounds.selectRound')}
            style={{ width: 200 }}
            value={`${selectedRound}`}
            onChange={(value) => setSelectedRound(Number(value || 1))}
          />

          <TextInput
            placeholder={t('gameDetail:rounds.searchPlayers')}
            style={{ width: 250 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
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

      {isSetupMode && !loading && !settingUp && canSetupMatchmaking && (
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
      )}

      {isSetupMode && !loading && !settingUp && !canSetupMatchmaking && (
        <EmptyStateCard
          description={t('gameDetail:rounds.setupNotAvailableDescription')}
          title={t('gameDetail:rounds.setupNotAvailable')}
        />
      )}

      {(loading || settingUp) && (
        <Text c="dimmed" ta="center">
          {settingUp
            ? t('gameDetail:rounds.generatingTables')
            : t('common:actions.loading')}
        </Text>
      )}

      {!loading &&
        !isSetupMode &&
        !settingUp &&
        tables.length === 0 &&
        !displayError && (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('gameDetail:rounds.noTables')}
            </Text>
          </Card>
        )}

      {!loading &&
        !isSetupMode &&
        !settingUp &&
        tables.length > 0 &&
        filteredAndSortedTables.length === 0 &&
        searchQuery.trim() && (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('gameDetail:rounds.noSearchResults')}
            </Text>
          </Card>
        )}

      {!loading && !settingUp && filteredAndSortedTables.length > 0 && (
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
      )}

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
