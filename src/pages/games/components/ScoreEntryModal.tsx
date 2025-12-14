import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Player, Table } from '../../../slices/types';

interface ScoreEntryModalProps {
  isOpen: boolean;
  table: Table | null;
  roundNumber: number;
  onClose: () => void;
  onSubmit: (scores: { playerID: number; score: number }[]) => void;
}

const ScoreEntryModal = ({
  isOpen,
  table,
  roundNumber,
  onClose,
  onSubmit,
}: ScoreEntryModalProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const [scores, setScores] = useState<Record<number, number>>({});

  const players = useMemo(() => table?.players || [], [table]);

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

  const handleSubmit = () => {
    const scoresArray = players.map((player: Player) => ({
      playerID: player.id,
      score: scores[player.id] ?? initialScores[player.id] ?? 0,
    }));
    onSubmit(scoresArray);
    notifications.show({
      title: t('actions.success'),
      message: t('rounds.scoresSaved', {
        table: table.tableNumber,
      }),
      color: 'green',
    });
    onClose();
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
          <Button color="gray" variant="subtle" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit}>{t('rounds.saveScores')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ScoreEntryModal;
