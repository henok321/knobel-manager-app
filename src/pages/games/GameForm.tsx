import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../../components/Modal';

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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {t('pages.games.form.heading')}
      </h2>
      <form className="space-y-6" onSubmit={submit}>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="name"
          >
            {t('pages.games.form.label.name')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="name"
            name="name"
            type="text"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="teamSize"
          >
            {t('pages.games.form.label.teamSize')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="teamSize"
            name="teamSize"
            type="number"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="tableSize"
          >
            {t('pages.games.form.label.tableSize')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="tableSize"
            name="tableSize"
            type="number"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="numberOfRounds"
          >
            {t('pages.games.form.label.numberOfRounds')}
          </label>
          <input
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            id="numberOfRounds"
            name="numberOfRounds"
            type="number"
          />
        </div>
        <div className="flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            type="submit"
          >
            {t('pages.games.form.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GameForm;
