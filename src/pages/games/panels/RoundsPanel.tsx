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
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { gamesApi } from '../../../api/apiClient';
import type { Table } from '../../../generated';
import { GameStatusEnum } from '../../../generated';
import useTables from '../../../slices/tables/hooks';
import { Game } from '../../../slices/types';
import { RootState } from '../../../store/store';
import { PlayerScoreRow } from '../components/PlayerScoreRow';
import ScoreEntryModal from '../components/ScoreEntryModal';

interface RoundsPanelProps {
  game: Game;
}

const RoundsPanel = ({ game }: RoundsPanelProps) => {
  const { t } = useTranslation();
  const {
    tables,
    status,
    error: tablesError,
    fetchTables,
    updateScores,
  } = useTables();
  const teamsEntities = useSelector((state: RootState) => state.teams.entities);
  const [selectedRound, setSelectedRound] = useState<string>('1');
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Permission flags based on game status
  const canEditScores = game.status === GameStatusEnum.InProgress;
  const canSetupMatchmaking = game.status === GameStatusEnum.Setup;

  // Generate round options (memoized)
  const roundOptions = useMemo(
    () =>
      Array.from({ length: game.numberOfRounds }, (_, i) => ({
        value: String(i + 1),
        label: `${t('pages.gameDetail.rounds.round')} ${i + 1}`,
      })),
    [game.numberOfRounds, t],
  );

  const filteredAndSortedTables = useMemo(() => {
    // Filter by selected round first
    let filtered = tables.filter(
      (table) =>
        table.roundID === Number(selectedRound) &&
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
  }, [tables, searchQuery, selectedRound]);

  useEffect(() => {
    if (!game.id || !selectedRound) return;

    fetchTables(game.id, Number(selectedRound));
  }, [game.id, selectedRound, fetchTables]);

  useEffect(() => {
    if (status === 'failed' && tablesError?.includes('404')) {
      setIsSetupMode(true);
    } else if (status === 'succeeded' && tables.length > 0) {
      setIsSetupMode(false);
    } else if (status === 'succeeded' && tables.length === 0) {
      setIsSetupMode(true);
    }
  }, [status, tablesError, tables.length]);

  const handleSetupGame = async () => {
    setSettingUp(true);
    setSetupError(null);

    try {
      await gamesApi.setupGame(game.id);

      fetchTables(game.id, Number(selectedRound));
      setIsSetupMode(false);
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error).message ||
        t('pages.gameDetail.rounds.setupError');
      setSetupError(errorMessage);
    } finally {
      setSettingUp(false);
    }
  };

  const handleOpenScoreEntry = (table: Table) => {
    setSelectedTable(table);
    setScoreModalOpen(true);
  };

  const handleSubmitScores = async (
    scores: { playerID: number; score: number }[],
  ) => {
    if (!selectedTable) return;

    try {
      updateScores(
        game.id,
        Number(selectedRound),
        selectedTable.tableNumber,
        scores,
      );
      setScoreModalOpen(false);
    } catch (err) {
      setSetupError(
        err instanceof Error ? err.message : t('global.errorOccurred'),
      );
    }
  };

  const hasScores = (table: Table) => table.scores && table.scores.length > 0;

  const loading = status === 'pending';
  const displayError =
    setupError ||
    (status === 'failed' && !tablesError?.includes('404') ? tablesError : null);

  return (
    <Stack gap="md">
      <style>{`
        .rounds-table tbody tr > td:nth-child(2),
        .rounds-table thead tr > th:nth-child(2) { text-align: center; }
        .rounds-table tbody tr > td:nth-child(3),
        .rounds-table thead tr > th:nth-child(3) { text-align: right; }
      `}</style>
      {!isSetupMode && (
        <Group align="flex-end" justify="space-between" wrap="wrap">
          <Select
            data={roundOptions}
            disabled={isSetupMode}
            label={t('pages.gameDetail.rounds.selectRound')}
            style={{ width: 200 }}
            value={selectedRound}
            onChange={(value) => setSelectedRound(value || '1')}
          />

          <TextInput
            placeholder={t('pages.gameDetail.rounds.searchPlayers')}
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
              {t('pages.gameDetail.rounds.rerunMatchmaking')}
            </Button>
          )}
        </Group>
      )}

      {/* Error Alert */}
      {displayError && (
        <Alert color="red" title={t('global.error')}>
          {displayError}
        </Alert>
      )}

      {isSetupMode && !loading && !settingUp && canSetupMatchmaking && (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="md">
            <Title order={4}>
              {t('pages.gameDetail.rounds.setupRequired')}
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              {t('pages.gameDetail.rounds.setupDescription')}
            </Text>
            <Button loading={settingUp} size="lg" onClick={handleSetupGame}>
              {t('pages.gameDetail.rounds.setupMatchmaking')}
            </Button>
          </Stack>
        </Card>
      )}

      {isSetupMode && !loading && !settingUp && !canSetupMatchmaking && (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="md">
            <Title order={4}>
              {t('pages.gameDetail.rounds.setupNotAvailable')}
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              {t('pages.gameDetail.rounds.setupNotAvailableDescription')}
            </Text>
          </Stack>
        </Card>
      )}

      {(loading || settingUp) && (
        <Text c="dimmed" ta="center">
          {settingUp
            ? t('pages.gameDetail.rounds.generatingTables')
            : t('global.loading')}
        </Text>
      )}

      {/* No Tables (after setup failed or empty) */}
      {!loading &&
        !isSetupMode &&
        !settingUp &&
        tables.length === 0 &&
        !displayError && (
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Text c="dimmed" ta="center">
              {t('pages.gameDetail.rounds.noTables')}
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
              {t('pages.gameDetail.rounds.noSearchResults')}
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
                      {`${t('pages.gameDetail.rounds.table')} ${table.tableNumber + 1}`}
                    </Title>
                    {hasScores(table) ? (
                      <Badge
                        color="green"
                        leftSection={
                          <IconCheck style={{ width: 14, height: 14 }} />
                        }
                        variant="light"
                      >
                        {t('pages.gameDetail.rounds.scoresEntered')}
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        leftSection={
                          <IconClock style={{ width: 14, height: 14 }} />
                        }
                        variant="light"
                      >
                        {t('pages.gameDetail.rounds.scoresPending')}
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
                        ? t('pages.gameDetail.rounds.editScores')
                        : t('pages.gameDetail.rounds.enterScores')}
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
                      <MantineTable.Th>
                        {t('pages.gameDetail.rounds.player')}
                      </MantineTable.Th>
                      <MantineTable.Th>
                        {t('pages.gameDetail.rounds.team')}
                      </MantineTable.Th>
                      <MantineTable.Th>
                        {t('pages.gameDetail.rounds.score')}
                      </MantineTable.Th>
                    </MantineTable.Tr>
                  </MantineTable.Thead>
                  <MantineTable.Tbody>
                    {table.players?.map((player) => {
                      const playerScore = table.scores?.find(
                        (s) => s.playerID === player.id,
                      );
                      const team = player.teamID
                        ? teamsEntities[player.teamID]
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
        isOpen={scoreModalOpen}
        roundNumber={Number(selectedRound)}
        table={selectedTable}
        onClose={() => setScoreModalOpen(false)}
        onSubmit={handleSubmitScores}
      />
    </Stack>
  );
};

export default RoundsPanel;
