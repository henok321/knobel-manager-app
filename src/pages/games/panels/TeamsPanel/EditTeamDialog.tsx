import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notifyError } from '../../../../utils/notifyError';
import type { PlayerName } from './teamChanges.ts';

interface EditTeamDialogProps {
  teamName: string;
  players: PlayerName[];
  onClose: () => void;
  onSave: (teamName: string, players: PlayerName[]) => Promise<unknown>;
}

const EditTeamDialog = ({
  teamName,
  players,
  onClose,
  onSave,
}: EditTeamDialogProps) => {
  const { t } = useTranslation();

  const [name, setName] = useState(teamName);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});

  const playerNameFor = (player: PlayerName) =>
    (playerNames[player.id] ?? player.name).trim();

  const isIncomplete =
    !name.trim() || players.some((player) => !playerNameFor(player));

  const handleSave = async () => {
    if (isIncomplete) {
      return;
    }
    const updatedPlayers = players.map((player) => ({
      id: player.id,
      name: playerNameFor(player),
    }));
    try {
      await onSave(name.trim(), updatedPlayers);
    } catch {
      notifyError();
      return;
    }
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleSave();
    }
  };

  const updatePlayerName = (playerID: number, newName: string) => {
    setPlayerNames((prev) => ({
      ...prev,
      [playerID]: newName,
    }));
  };

  return (
    <Modal
      centered
      opened
      size="md"
      title={
        <Text fw={600} size="xl">
          {t('gameDetail:teams.editTeamDialog')}
        </Text>
      }
      onClose={onClose}
    >
      <Stack gap="md">
        <TextInput
          autoFocus
          data-autofocus
          label={t('gameDetail:teams.teamName')}
          placeholder={t('gameDetail:teams.teamNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />

        <Stack gap="xs">
          {players.map((player, index) => (
            <TextInput
              key={player.id}
              label={`${t('gameDetail:teams.player')} ${index + 1}`}
              placeholder={t('gameDetail:teams.playerNamePlaceholder')}
              value={playerNames[player.id] ?? player.name}
              onChange={(e) =>
                updatePlayerName(player.id, e.currentTarget.value)
              }
              onKeyDown={handleKeyDown}
            />
          ))}
        </Stack>

        <Group gap="sm" justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t('common:actions.cancel')}
          </Button>
          <Button disabled={isIncomplete} onClick={() => void handleSave()}>
            {t('common:actions.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditTeamDialog;
