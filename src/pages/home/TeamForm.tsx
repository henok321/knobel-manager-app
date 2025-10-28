import { Modal, Text, TextInput, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TeamFormData {
  name: string;
  members: string[];
}

export interface TeamFormProps {
  teamSize: number;
  isOpen: boolean;
  onClose: () => void;
  createTeam: (team: TeamFormData) => void;
}

const TeamForm = ({ isOpen, onClose, createTeam, teamSize }: TeamFormProps) => {
  const { t } = useTranslation(['home', 'games', 'common']);
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['']);

  const handleClose = () => {
    // Reset form when closing
    setTeamName('');
    setPlayers(['']);
    onClose();
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTeam({ name: teamName, members: players });
    notifications.show({
      title: t('actions.success'),
      message: t('card.teamAdded', { name: teamName, ns: 'games' }),
      color: 'green',
    });
    handleClose();
  };

  const handleChangeTeamName = (e: ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  const handleChangePlayer = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const newPlayers = [...players];
    newPlayers[index] = e.target.value;
    setPlayers(newPlayers);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const addPlayer = () => {
    if (players.length < teamSize) {
      setPlayers([...players, '']);
    }
  };

  return (
    <Modal
      centered
      opened={isOpen}
      title={
        <Text fw={600} size="xl">
          {t('team.form.heading')}
        </Text>
      }
      onClose={handleClose}
    >
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            autoFocus
            required
            id="team-name"
            label={t('team.form.label.name')}
            name="team-name"
            value={teamName}
            onChange={handleChangeTeamName}
          />

          <div>
            <Text fw={500} mb="xs" size="sm">
              {t('team.form.label.players')}
            </Text>
            <Stack gap="xs">
              {players.map((player, index) => (
                <Group key={index} gap="xs">
                  <TextInput
                    required
                    id={`player-${index}`}
                    name={`player-${index}`}
                    style={{ flex: 1 }}
                    value={player}
                    onChange={(e) => handleChangePlayer(index, e)}
                  />
                  <Button
                    aria-label={t('team.form.removePlayer')}
                    color="red"
                    disabled={players.length === 1}
                    px={6}
                    type="button"
                    variant="subtle"
                    onClick={() => removePlayer(index)}
                  >
                    <IconTrash style={{ width: 20, height: 20 }} />
                  </Button>
                </Group>
              ))}
              <Button
                aria-label={t('team.form.addPlayer')}
                color="green"
                disabled={players.length >= teamSize}
                leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
                mt="xs"
                size="xs"
                type="button"
                variant="subtle"
                onClick={addPlayer}
              >
                <Text size="sm">{t('team.form.addPlayer')}</Text>
              </Button>
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button disabled={players.length !== teamSize} type="submit">
              {t('team.form.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TeamForm;
