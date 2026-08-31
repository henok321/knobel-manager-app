import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamsRequest } from '../../../../store/api.gen.ts';

interface TeamFormProps {
  teamSize: number;
  isSubmitting: boolean;
  onClose: () => void;
  createTeam: (team: TeamsRequest) => void;
}

const TeamForm = ({
  isSubmitting,
  onClose,
  createTeam,
  teamSize,
}: TeamFormProps) => {
  const { t } = useTranslation();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['']);

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTeam({
      name: teamName,
      players: players.map((name) => ({ name })),
    });
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
    setPlayers(players.filter((_, i) => i !== index));
  };

  const addPlayer = () => {
    setPlayers([...players, '']);
  };

  return (
    <Modal
      centered
      opened
      title={
        <Text fw={600} size="xl">
          {t('games:team.form.heading')}
        </Text>
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            autoFocus
            required
            autoComplete={'off'}
            id="team-name"
            label={t('games:team.form.label.name')}
            name="team-name"
            value={teamName}
            onChange={(e) => setTeamName(e.currentTarget.value)}
          />

          <div>
            <Text fw={500} mb="xs" size="sm">
              {t('games:team.form.label.players')}
            </Text>
            <Stack gap="xs">
              {players.map((player, index) => (
                <Group key={index} gap="xs">
                  <TextInput
                    required
                    autoComplete={'off'}
                    id={`player-${index}`}
                    name={`player-${index}`}
                    style={{ flex: 1 }}
                    value={player}
                    onChange={(e) => handleChangePlayer(index, e)}
                  />
                  <Button
                    aria-label={t('games:team.form.removePlayer')}
                    color="red"
                    disabled={players.length === 1}
                    px={6}
                    type="button"
                    variant="subtle"
                    onClick={() => removePlayer(index)}
                  >
                    <IconTrash size={20} stroke={1.5} />
                  </Button>
                </Group>
              ))}
              <Button
                aria-label={t('games:team.form.addPlayer')}
                color="green"
                disabled={players.length >= teamSize}
                leftSection={<IconPlus size={20} stroke={1.5} />}
                mt="xs"
                size="xs"
                type="button"
                variant="subtle"
                onClick={addPlayer}
              >
                <Text size="sm">{t('games:team.form.addPlayer')}</Text>
              </Button>
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button
              disabled={players.length !== teamSize}
              loading={isSubmitting}
              type="submit"
            >
              {t('games:team.form.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TeamForm;
