import { FormEvent } from 'react';
import Modal from '../components/Modal.tsx';
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
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const game = {
      name: formData.get('name') as string,
      teamSize: Number(formData.get('teamSize')),
      tableSize: Number(formData.get('tableSize')),
      numberOfRounds: Number(formData.get('numberOfRounds')),
    } as GameFormData;
    createGame(game);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2 className="mb-4 text-xl font-bold">{t('GAMES_FORM_HEADLINE')}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('GAMES_FORM_LABEL_NAME')}
            </label>
            <input
              type="text"
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('GAMES_FORM_LABEL_TEAM_SIZE')}
            </label>
            <input
              type="number"
              name="teamSize"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('GAMES_FORM_LABEL_TABLE_SIZE')}
            </label>
            <input
              type="number"
              name="tableSize"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('GAMES_FORM_LABEL_ROUNDS')}
            </label>
            <input
              type="number"
              name="numberOfRounds"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              {t('GAMES_FORM_SUBMIT_BUTTON')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default GameForm;
