import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useState, type KeyboardEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Player {
  id: number;
  name: string;
}

interface EditTeamDialogProps {
  isOpen: boolean;
  teamName: string;
  players: Player[];
  onClose: () => void;
  onSave: (teamName: string, players: { id: number; name: string }[]) => void;
}

const EditTeamDialogContent = ({
  teamName,
  players,
  onClose,
  onSave,
}: Omit<EditTeamDialogProps, 'isOpen'>) => {
  const { t } = useTranslation();

  const initialPlayerNames: Record<number, string> = useMemo(() => {
    const names: Record<number, string> = {};
    players.forEach((p) => {
      names[p.id] = p.name;
    });
    return names;
  }, [players]);

  const [name, setName] = useState(teamName);
  const [playerNames, setPlayerNames] =
    useState<Record<number, string>>(initialPlayerNames);

  const handleSave = () => {
    if (name.trim()) {
      const updatedPlayers = players.map((p) => ({
        id: p.id,
        name: (playerNames[p.id] || p.name).trim(),
      }));
      onSave(name.trim(), updatedPlayers);
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const updatePlayerName = (playerID: number, newName: string) => {
    setPlayerNames((prev) => ({
      ...prev,
      [playerID]: newName,
    }));
  };

  return (
    <Stack gap="md">
      <TextInput
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
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
            value={playerNames[player.id] || player.name}
            onChange={(e) => updatePlayerName(player.id, e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        ))}
      </Stack>

      <Group gap="sm" justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose}>
          {t('common:actions.cancel')}
        </Button>
        <Button disabled={!name.trim()} onClick={handleSave}>
          {t('common:actions.save')}
        </Button>
      </Group>
    </Stack>
  );
};

const EditTeamDialog = ({
  isOpen,
  teamName,
  players,
  onClose,
  onSave,
}: EditTeamDialogProps) => {
  const { t } = useTranslation();
  const dialogKey = `${isOpen}-${teamName}-${players.map((p) => p.id).join('-')}`;

  return (
    <Modal
      centered
      opened={isOpen}
      size="md"
      title={
        <Text fw={600} size="xl">
          {t('gameDetail:teams.editTeamDialog')}
        </Text>
      }
      onClose={onClose}
    >
      <EditTeamDialogContent
        key={dialogKey}
        players={players}
        teamName={teamName}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
};

export default EditTeamDialog;
