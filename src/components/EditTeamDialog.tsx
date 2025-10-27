import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useState, useMemo, type KeyboardEvent } from 'react';
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
  const { t } = useTranslation(['gameDetail', 'common']);
  const initialPlayerNames = useMemo(() => {
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

  const updatePlayerName = (playerId: number, newName: string) => {
    setPlayerNames((prev) => ({
      ...prev,
      [playerId]: newName,
    }));
  };

  return (
    <Stack gap="md">
      <TextInput
        autoFocus
        data-autofocus
        label={t('teams.teamName')}
        placeholder={t('teams.teamNamePlaceholder')}
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />

      <Stack gap="xs">
        {players.map((player, index) => (
          <TextInput
            key={player.id}
            label={`${t('teams.player')} ${index + 1}`}
            placeholder={t('teams.playerNamePlaceholder')}
            value={playerNames[player.id] || player.name}
            onChange={(e) => updatePlayerName(player.id, e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        ))}
      </Stack>

      <Group gap="sm" justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose}>
          {t('actions.cancel')}
        </Button>
        <Button disabled={!name.trim()} onClick={handleSave}>
          {t('actions.save')}
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
  const { t } = useTranslation(['gameDetail', 'common']);
  const dialogKey = `${isOpen}-${teamName}-${players.map((p) => p.id).join('-')}`;

  return (
    <Modal
      centered
      opened={isOpen}
      size="md"
      title={t('teams.editTeamDialog')}
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
