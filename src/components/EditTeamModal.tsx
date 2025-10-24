import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useState, useEffect, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface EditTeamModalProps {
  isOpen: boolean;
  teamName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const EditTeamModal = ({
  isOpen,
  teamName,
  onClose,
  onSave,
}: EditTeamModalProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // Initialize value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(teamName); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isOpen, teamName]);

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
      title={t('pages.gameDetail.teams.editTeam')}
      onClose={onClose}
    >
      <Stack gap="md">
        <TextInput
          autoFocus
          data-autofocus
          label={t('pages.gameDetail.teams.teamName')}
          placeholder={t('pages.gameDetail.teams.teamNamePlaceholder')}
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

export default EditTeamModal;
