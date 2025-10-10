import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Player, Table } from '../../../generated/models';

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
  const { t } = useTranslation();
  const [scores, setScores] = useState<Record<number, number>>({});

  if (!table) return null;

  const players = table.players || [];

  // Initialize scores from existing data or empty
  const initialScores: Record<number, number> = {};
  players.forEach((player: Player) => {
    const existingScore = table.scores?.find((s) => s.playerID === player.id);
    initialScores[player.id] = existingScore?.score || 0;
  });

  const handleSubmit = () => {
    const scoresArray = players.map((player: Player) => ({
      playerID: player.id,
      score: scores[player.id] ?? initialScores[player.id] ?? 0,
    }));
    onSubmit(scoresArray);
    onClose();
  };

  return (
    <Modal
      centered
      opened={isOpen}
      size="md"
      title={
        <Text fw={600} size="xl">
          {t('pages.gameDetail.rounds.enterScores')} -{' '}
          {t('pages.gameDetail.rounds.table')} {table.tableNumber}
        </Text>
      }
      onClose={onClose}
    >
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          {t('pages.gameDetail.rounds.round')} {roundNumber}
        </Text>

        {/* Score inputs for each player */}
        {players.map((player: Player) => (
          <NumberInput
            key={player.id}
            defaultValue={initialScores[player.id]}
            label={player.name}
            min={0}
            placeholder="0"
            onChange={(value) =>
              setScores((prev) => ({
                ...prev,
                [player.id]: typeof value === 'number' ? value : 0,
              }))
            }
          />
        ))}

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button color="gray" variant="subtle" onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {t('pages.gameDetail.rounds.saveScores')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ScoreEntryModal;
