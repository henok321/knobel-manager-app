import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../../components/Modal';

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

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const team: TeamFormData = {
      name: teamName,
      members: players,
    };
    createTeam(team);
    onClose();
  };

  const handleChangeTeamName = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTeamName(e.target.value);
  };

  const handleChangePlayer = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {t('pages.home.team.form.heading')}
      </h2>
      <form className="space-y-6" onSubmit={submit}>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="name"
          >
            {t('pages.home.team.form.label.name')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="name"
            name="name"
            type="text"
            value={teamName}
            onChange={handleChangeTeamName}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="player"
          >
            {t('pages.home.team.form.label.players')}
          </label>
          {players.map((player, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="name"
                name="name"
                type="text"
                value={player}
                onChange={(e) => handleChangePlayer(index, e)}
              />
              <button
                aria-label={t('pages.home.team.form.removePlayer')}
                className="m-2 disabled:opacity-50"
                disabled={players.length < 2}
                onClick={() => removePlayer(index)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            aria-label={t('pages.home.team.form.addPlayer')}
            className="mt-2 disabled:opacity-50"
            disabled={players.length == teamSize}
            onClick={() => addPlayer()}
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-blue-300"
            disabled={players.length !== teamSize}
            type="submit"
          >
            {t('pages.home.team.form.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamForm;
