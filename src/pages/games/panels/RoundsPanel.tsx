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
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { gamesApi } from '../../../api/apiClient';
import type { Table } from '../../../generated/models';
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

  // Generate round options
  const roundOptions = Array.from({ length: game.numberOfRounds }, (_, i) => ({
    value: String(i + 1),
    label: `${t('pages.gameDetail.rounds.round')} ${i + 1}`,
  }));

  // Fetch tables for the selected round
  useEffect(() => {
    if (!game.id || !selectedRound) return;

    fetchTables(game.id, Number(selectedRound));
  }, [game.id, selectedRound, fetchTables]);

  // Determine setup mode based on status and error
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
      // Call the setup endpoint to generate tables for all rounds
      await gamesApi.setupGame(game.id);

      // Refresh tables for current round using Redux
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
      {/* Round Selector */}
      <Group align="flex-end" justify="space-between">
        <Select
          data={roundOptions}
          disabled={isSetupMode}
          label={t('pages.gameDetail.rounds.selectRound')}
          style={{ width: 200 }}
          value={selectedRound}
          onChange={(value) => setSelectedRound(value || '1')}
        />

        {isSetupMode && (
          <Button loading={settingUp} size="md" onClick={handleSetupGame}>
            {t('pages.gameDetail.rounds.setupMatchmaking')}
          </Button>
        )}
      </Group>

      {/* Error Alert */}
      {displayError && (
        <Alert color="red" title={t('global.error')}>
          {displayError}
        </Alert>
      )}

      {/* Setup Mode */}
      {isSetupMode && !loading && !settingUp && (
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

      {/* Loading State */}
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

      {/* Tables Display */}
      {!loading && !settingUp && tables.length > 0 && (
        <Stack gap="md">
          {tables.map((table) => (
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
                      {t('pages.gameDetail.rounds.table')}
                      {table.tableNumber + 1}
                    </Title>
                    {hasScores(table) && (
                      <Badge color="green" variant="light">
                        {t('pages.gameDetail.rounds.scoresEntered')}
                      </Badge>
                    )}
                  </Group>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => handleOpenScoreEntry(table)}
                  >
                    {hasScores(table)
                      ? t('pages.gameDetail.rounds.editScores')
                      : t('pages.gameDetail.rounds.enterScores')}
                  </Button>
                </Group>

                {/* Players and Scores */}
                <MantineTable>
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

      {/* Score Entry Modal */}
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
