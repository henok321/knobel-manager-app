import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateScoresMutation } from '../../../api/rtkQueryApi';
import type { Player, Table } from '../../../generated';

interface ScoreEntryModalProps {
  isOpen: boolean;
  table: Table | null;
  roundNumber: number;
  gameId: number;
  onClose: () => void;
}

const ScoreEntryModal = ({
  isOpen,
  table,
  roundNumber,
  gameId,
  onClose,
}: ScoreEntryModalProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [updateScores, { isLoading: isSaving }] = useUpdateScoresMutation();

  const players = useMemo(() => table?.players || [], [table?.players]);

  const initialScores = useMemo(() => {
    const scoreMap: Record<number, number> = {};
    for (const player of players) {
      const existingScore = table?.scores?.find(
        (s) => s.playerID === player.id,
      );
      scoreMap[player.id] = existingScore?.score || 0;
    }
    return scoreMap;
  }, [players, table?.scores]);

  if (!table) return null;

  const handleSubmit = async () => {
    const scoresArray = players.map((player: Player) => ({
      playerID: player.id,
      score: scores[player.id] ?? initialScores[player.id] ?? 0,
    }));

    try {
      await updateScores({
        gameId,
        roundNumber,
        tableNumber: table.tableNumber,
        scores: scoresArray,
      }).unwrap();

      notifications.show({
        title: t('actions.success'),
        message: t('rounds.scoresSaved', {
          table: table.tableNumber,
        }),
        color: 'green',
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: t('actions.error'),
        message:
          error instanceof Error ? error.message : t('actions.errorOccurred'),
        color: 'red',
      });
    }
  };

  return (
    <Modal
      centered
      opened={isOpen}
      size="md"
      title={
        <Text fw={600} size="xl">
          {t('rounds.enterScores')} - {t('rounds.table')} {table.tableNumber}
        </Text>
      }
      onClose={onClose}
    >
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          {t('rounds.round')} {roundNumber}
        </Text>

        {players.map((player: Player) => (
          <NumberInput
            key={player.id}
            defaultValue={initialScores[player.id]}
            label={player.name}
            min={0}
            placeholder={t('rounds.scorePlaceholder')}
            onChange={(value) =>
              setScores((prev) => ({
                ...prev,
                [player.id]: typeof value === 'number' ? value : 0,
              }))
            }
          />
        ))}

        <Group justify="flex-end" mt="md">
          <Button
            color="gray"
            disabled={isSaving}
            variant="subtle"
            onClick={onClose}
          >
            {t('actions.cancel')}
          </Button>
          <Button loading={isSaving} onClick={handleSubmit}>
            {t('rounds.saveScores')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ScoreEntryModal;
