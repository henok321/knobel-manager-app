import { useState } from 'react';
import { Game } from '../../slices/types.ts';
import { useTranslation } from 'react-i18next';

export type GameCardProps = {
  game: Game;
  isActiveGame: boolean;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
};

const GameCard = ({
  game,
  onActivate,
  onDelete,
  isActiveGame,
}: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="mb-4 cursor-pointer rounded-lg border p-4 shadow-md transition-transform hover:shadow"
      onClick={toggleExpand}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{game.name}</h2>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-2 py-1 text-sm ${
              game.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {game.status}
          </span>
          {isActiveGame && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
              {t('pages.games.card.isActive')}
            </span>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4">
          <p>
            <strong>{t('pages.games.card.details.teamSize')}</strong>{' '}
            {game.teamSize}
          </p>
          <p>
            <strong>{t('pages.games.card.details.tableSize')}</strong>{' '}
            {game.tableSize}
          </p>
          <p>
            <strong>{t('pages.games.card.details.numberOfRounds')}</strong>{' '}
            {game.numberOfRounds}
          </p>
          <div className="mt-4 flex space-x-2">
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isActiveGame}
              onClick={(e) => {
                e.stopPropagation();
                onActivate(game.id);
              }}
            >
              {t('pages.games.card.activateButton')}
            </button>
            <button
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game.id);
              }}
            >
              {t('pages.games.card.deleteButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
