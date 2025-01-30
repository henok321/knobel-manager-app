import { FormEvent } from 'react';
import Modal from '../../components/Modal';
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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {t('pages.games.form.heading')}
      </h2>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.games.form.label.name')}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="teamSize"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.games.form.label.teamSize')}
          </label>
          <input
            type="number"
            name="teamSize"
            id="teamSize"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="tableSize"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.games.form.label.tableSize')}
          </label>
          <input
            type="number"
            name="tableSize"
            id="tableSize"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="numberOfRounds"
            className="block text-sm font-medium text-gray-700"
          >
            {t('pages.games.form.label.numberOfRounds')}
          </label>
          <input
            type="number"
            name="numberOfRounds"
            id="numberOfRounds"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {t('pages.games.form.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GameForm;
