import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useState, useEffect, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface EditPlayerModalProps {
  isOpen: boolean;
  playerName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const EditPlayerModal = ({
  isOpen,
  playerName,
  onClose,
  onSave,
}: EditPlayerModalProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // Initialize value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(playerName); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isOpen, playerName]);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
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

  return (
    <Modal
      opened={isOpen}
      title={t('pages.gameDetail.teams.editPlayer')}
      onClose={onClose}
    >
      <Stack gap="md">
        <TextInput
          autoFocus
          data-autofocus
          label={t('pages.gameDetail.teams.playerName')}
          placeholder={t('pages.gameDetail.teams.playerNamePlaceholder')}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />

        <Group gap="sm" justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button disabled={!value.trim()} onClick={handleSave}>
            {t('global.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditPlayerModal;
