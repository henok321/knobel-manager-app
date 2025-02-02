import { ChangeEvent, FormEvent, useState } from 'react';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

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
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.home.team.form.label.name')}
          </label>
          <input
            type="text"
            name="name"
            value={teamName}
            onChange={handleChangeTeamName}
            id="name"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="player"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.home.team.form.label.players')}
          </label>
          {players.map((player, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={player}
                onChange={(e) => handleChangePlayer(index, e)}
                name="name"
                id="name"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                disabled={players.length < 2}
                className="m-2 disabled:opacity-50"
                aria-label={t('pages.home.team.form.removePlayer')}
                onClick={() => removePlayer(index)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            className="mt-2 disabled:opacity-50"
            disabled={players.length == teamSize}
            aria-label={t('pages.home.team.form.addPlayer')}
            onClick={() => addPlayer()}
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={players.length !== teamSize}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-blue-300"
          >
            {t('pages.home.team.form.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamForm;
