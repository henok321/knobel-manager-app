import {
  Modal,
  Text,
  TextInput,
  NumberInput,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

export interface GameFormData {
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
}

export interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  createGame: (game: GameFormData) => void;
}

const GameForm = ({ isOpen, onClose, createGame }: GameFormProps) => {
  const { t } = useTranslation();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const game: GameFormData = {
      name: formData.get('name') as string,
      teamSize: Number(formData.get('teamSize')),
      tableSize: Number(formData.get('tableSize')),
      numberOfRounds: Number(formData.get('numberOfRounds')),
    };
    createGame(game);
    notifications.show({
      title: t('global.success'),
      message: t('pages.games.card.gameCreated', { name: game.name }),
      color: 'green',
    });
    onClose();
  };

  return (
    <Modal
      centered
      opened={isOpen}
      title={
        <Text fw={600} size="xl">
          {t('pages.games.form.heading')}
        </Text>
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            autoFocus
            required
            id="name"
            label={t('pages.games.form.label.name')}
            name="name"
          />
          <NumberInput
            required
            id="teamSize"
            label={t('pages.games.form.label.teamSize')}
            min={1}
            name="teamSize"
          />
          <NumberInput
            required
            id="tableSize"
            label={t('pages.games.form.label.tableSize')}
            min={1}
            name="tableSize"
          />
          <NumberInput
            required
            id="numberOfRounds"
            label={t('pages.games.form.label.numberOfRounds')}
            min={1}
            name="numberOfRounds"
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit">{t('pages.games.form.submit')}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default GameForm;
