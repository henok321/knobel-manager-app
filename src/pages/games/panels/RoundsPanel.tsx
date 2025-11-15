import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Table as MantineTable,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetGameQuery, type TableWithRound } from '../../../api/rtkQueryApi';
import type { Table } from '../../../api/types';
import { GameStatusEnum } from '../../../api/types';
import useGames from '../../../hooks/useGames';
import useTeams from '../../../hooks/useTeams';
import { Game } from '../../../types';
import { PlayerScoreRow } from '../components/PlayerScoreRow';
import ScoreEntryModal from '../components/ScoreEntryModal';

interface RoundsPanelProps {
  game: Game;
}

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { setupGame, status: gamesStatus } = useGames();
  const { allTeams } = useTeams();

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canEditScores = game.status === GameStatusEnum.InProgress;
  const canSetupMatchmaking = game.status === GameStatusEnum.Setup;
  const hasRounds = (game.rounds?.length || 0) > 0;

  // Fetch game data using RTK Query
  const {
    data: gameData,
    isLoading: tablesLoading,
    error: tablesError,
  } = useGetGameQuery({ gameId: game.id });

  const allTables = useMemo<TableWithRound[]>(() => {
    if (!gameData?.rounds) return [];
    return gameData.rounds.flatMap((round) =>
      (round.tables || []).map((table) => ({
        ...table,
        roundNumber: round.roundNumber,
      })),
    );
  }, [gameData]);

  const isSetupMode = !hasRounds || allTables.length === 0;
  const tablesStatus = tablesLoading
    ? 'pending'
    : tablesError
      ? 'failed'
      : 'succeeded';

  const roundOptions = useMemo(
    () =>
      Array.from({ length: game.numberOfRounds }, (_, i) => ({
        value: String(i + 1),
        label: `${t('rounds.round')} ${i + 1}`,
      })),
    [game.numberOfRounds, t],
  );

  const getPersistedRound = () => {
    const stored = localStorage.getItem(`selected_round_for_game_${game.id}`);
    return stored || '1';
  };

  const [selectedRound, setSelectedRound] =
    useState<string>(getPersistedRound());

  useEffect(() => {
    localStorage.setItem(`selected_round_for_game_${game.id}`, selectedRound);
  }, [selectedRound, game.id]);

  // Filter and sort tables locally
  const filteredAndSortedTables = useMemo(() => {
    let filtered = allTables.filter(
      (table) =>
        table.roundNumber === Number(selectedRound) &&
        table.players &&
        table.players.length > 0,
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) =>
        table.players?.some((player) =>
          player.name?.toLowerCase().includes(query),
        ),
      );
    }

    return filtered.sort((a, b) => a.tableNumber - b.tableNumber);
  }, [allTables, selectedRound, searchQuery]);

  const handleSetupGame = async () => {
    setSetupError(null);

    try {
      await setupGame(game.id);
      // RTK Query will automatically refetch tables after setup
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error).message ||
        t('rounds.setupError');
      setSetupError(errorMessage);
    }
  };

  const handleOpenScoreEntry = (table: Table) => {
    setSelectedTable(table);
    setScoreModalOpen(true);
  };

  const hasScores = (table: Table) => table.scores && table.scores.length > 0;

  const settingUp = gamesStatus === 'pending';
  const loading = tablesStatus === 'pending';

  // Handle RTK Query errors
  const tablesErrorMessage = tablesError
    ? typeof tablesError === 'object' &&
      true &&
      'status' in tablesError &&
      'data' in tablesError
      ? typeof tablesError.data === 'string'
        ? tablesError.data
        : JSON.stringify(tablesError.data)
      : String(tablesError)
    : null;

  const displayError =
    setupError ||
    (tablesStatus === 'failed' && !tablesErrorMessage?.includes('404')
      ? tablesErrorMessage
      : null);

  return (
    <Stack gap="md">
      <style>{`
        .rounds-table tbody tr > td:nth-child(2),
        .rounds-table thead tr > th:nth-child(2) { text-align: center; }
        .rounds-table tbody tr > td:nth-child(3),
        .rounds-table thead tr > th:nth-child(3) { text-align: right; }
      `}</style>
      {(!isSetupMode || game.status === GameStatusEnum.InProgress) && (
        <Group align="flex-end" justify="space-between" wrap="wrap">
          <Select
            data={roundOptions}
            label={t('rounds.selectRound')}
            style={{ width: 200 }}
            value={selectedRound}
            onChange={(value) => setSelectedRound(value || '1')}
          />

          <TextInput
            placeholder={t('rounds.searchPlayers')}
            style={{ width: 250 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          {canSetupMatchmaking && (
            <Button
              loading={settingUp}
              size="md"
              variant="light"
              onClick={handleSetupGame}
            >
              {t('rounds.rerunMatchmaking')}
            </Button>
          )}
        </Group>
      )}

      {displayError && (
        <Alert color="red" title={t('actions.error')}>
          {displayError}
        </Alert>
      )}

      {isSetupMode && !loading && !settingUp && canSetupMatchmaking && (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="md">
            <Title order={4}>{t('rounds.setupRequired')}</Title>
            <Text c="dimmed" size="sm" ta="center">
              {t('rounds.setupDescription')}
            </Text>
            <Button loading={settingUp} size="lg" onClick={handleSetupGame}>
              {t('rounds.setupMatchmaking')}
            </Button>
          </Stack>
        </Card>
      )}

      {isSetupMode && !loading && !settingUp && !canSetupMatchmaking && (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="md">
            <Title order={4}>{t('rounds.setupNotAvailable')}</Title>
            <Text c="dimmed" size="sm" ta="center">
              {t('rounds.setupNotAvailableDescription')}
            </Text>
          </Stack>
        </Card>
      )}

      {(loading || settingUp) && (
        <Text c="dimmed" ta="center">
          {settingUp ? t('rounds.generatingTables') : t('actions.loading')}
        </Text>
      )}

      {!loading &&
        !isSetupMode &&
        !settingUp &&
        allTables.length === 0 &&
        !displayError && (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('rounds.noTables')}
            </Text>
          </Card>
        )}

      {!loading &&
        !isSetupMode &&
        !settingUp &&
        allTables.length > 0 &&
        filteredAndSortedTables.length === 0 &&
        searchQuery.trim() && (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('rounds.noSearchResults')}
            </Text>
          </Card>
        )}

      {!loading && !settingUp && filteredAndSortedTables.length > 0 && (
        <Stack gap="md">
          {filteredAndSortedTables.map((table) => (
            <Card
              key={table.id}
              withBorder
              padding="lg"
              radius="md"
              shadow="sm"
            >
              <Stack gap="md">
                <Group align="center" justify="space-between">
                  <Group gap="xs">
                    <Title order={4}>
                      {`${t('rounds.table')} ${table.tableNumber}`}
                    </Title>
                    {hasScores(table) ? (
                      <Badge
                        color="green"
                        leftSection={
                          <IconCheck style={{ width: 14, height: 14 }} />
                        }
                        variant="light"
                      >
                        {t('rounds.scoresEntered')}
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        leftSection={
                          <IconClock style={{ width: 14, height: 14 }} />
                        }
                        variant="light"
                      >
                        {t('rounds.scoresPending')}
                      </Badge>
                    )}
                  </Group>
                  {canEditScores && (
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => handleOpenScoreEntry(table)}
                    >
                      {hasScores(table)
                        ? t('rounds.editScores')
                        : t('rounds.enterScores')}
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
                      <MantineTable.Th>{t('rounds.player')}</MantineTable.Th>
                      <MantineTable.Th>{t('rounds.team')}</MantineTable.Th>
                      <MantineTable.Th>{t('rounds.score')}</MantineTable.Th>
                    </MantineTable.Tr>
                  </MantineTable.Thead>
                  <MantineTable.Tbody>
                    {table.players?.map((player) => {
                      const playerScore = table.scores?.find(
                        (s) => s.playerID === player.id,
                      );
                      const team = player.teamID
                        ? allTeams.find((t) => t.id === player.teamID)
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
          ))}
        </Stack>
      )}

      <ScoreEntryModal
        gameId={game.id}
        isOpen={scoreModalOpen}
        roundNumber={Number(selectedRound)}
        table={selectedTable}
        onClose={() => setScoreModalOpen(false)}
      />
    </Stack>
  );
};

export default RoundsPanel;
