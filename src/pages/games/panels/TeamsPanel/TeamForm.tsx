import {
  Button,
  Group,
  List,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
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
  const [players, setPlayers] = useState<string[]>(() =>
    Array.from({ length: teamSize }, () => ''),
  );

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
            <List
              listStyleType=""
              type="ordered"
              spacing="xs"
              styles={{
                itemWrapper: { width: '100%', alignItems: 'stretch' },
              }}
            >
              {players.map((player, index) => (
                <List.Item key={index}>
                  <TextInput
                    required
                    autoComplete={'off'}
                    id={`player-${index}`}
                    name={`player-${index}`}
                    value={player}
                    onChange={(e) => handleChangePlayer(index, e)}
                  />
                </List.Item>
              ))}
            </List>
          </div>

          <Group justify="flex-end" mt="md">
            <Button loading={isSubmitting} type="submit">
              {t('games:team.form.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TeamForm;
