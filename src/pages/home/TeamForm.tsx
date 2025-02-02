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
    createTeam({ name: teamName, members: players });
    onClose();
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {t('pages.home.team.form.heading')}
      </h2>
      <form className="space-y-6" onSubmit={submit}>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="team-name"
          >
            {t('pages.home.team.form.label.name')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="team-name"
            name="team-name"
            type="text"
            value={teamName}
            onChange={handleChangeTeamName}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="players"
          >
            {t('pages.home.team.form.label.players')}
          </label>
          <div className="mt-1 space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center">
                <input
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id={`player-${index}`}
                  name={`player-${index}`}
                  type="text"
                  value={player}
                  onChange={(e) => handleChangePlayer(index, e)}
                />
                <button
                  aria-label={t('pages.home.team.form.removePlayer')}
                  className="ml-2 p-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                  disabled={players.length === 1}
                  type="button"
                  onClick={() => removePlayer(index)}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}

            <button
              aria-label={t('pages.home.team.form.addPlayer')}
              className="flex items-center p-2 text-green-500 hover:text-green-600 disabled:opacity-50"
              disabled={players.length >= teamSize}
              type="button"
              onClick={addPlayer}
            >
              <PlusIcon className="h-5 w-5" />
              <span className="ml-2 text-sm">
                {t('pages.home.team.form.addPlayer')}
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
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
