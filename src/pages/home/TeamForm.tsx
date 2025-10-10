import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Modal, Text, TextInput, Button, Group, Stack } from '@mantine/core';
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
  const { t } = useTranslation();
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
          {t('pages.home.team.form.heading')}
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
            label={t('pages.home.team.form.label.name')}
            name="team-name"
            value={teamName}
            onChange={handleChangeTeamName}
          />

          <div>
            <Text fw={500} mb="xs" size="sm">
              {t('pages.home.team.form.label.players')}
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
                    aria-label={t('pages.home.team.form.removePlayer')}
                    color="red"
                    disabled={players.length === 1}
                    px={6}
                    type="button"
                    variant="subtle"
                    onClick={() => removePlayer(index)}
                  >
                    <TrashIcon style={{ width: 20, height: 20 }} />
                  </Button>
                </Group>
              ))}
              <Button
                aria-label={t('pages.home.team.form.addPlayer')}
                color="green"
                disabled={players.length >= teamSize}
                leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
                mt="xs"
                size="xs"
                type="button"
                variant="subtle"
                onClick={addPlayer}
              >
                <Text size="sm">{t('pages.home.team.form.addPlayer')}</Text>
              </Button>
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button disabled={players.length !== teamSize} type="submit">
              {t('pages.home.team.form.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TeamForm;
