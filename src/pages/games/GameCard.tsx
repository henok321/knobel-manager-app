import { useState } from 'react';
import { Game } from '../../slices/games/types';

export type GameCardProps = {
  game: Game;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
};

const GameCard = ({ game, onActivate, onDelete }: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
        <span
          className={`rounded-full px-2 py-1 text-sm ${
            game.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {game.status}
        </span>
      </div>
      {isExpanded && (
        <div className="mt-4">
          <p>
            <strong>Team Size:</strong> {game.teamSize}
          </p>
          <p>
            <strong>Table Size:</strong> {game.tableSize}
          </p>
          <p>
            <strong>Number of Rounds:</strong> {game.numberOfRounds}
          </p>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActivate(game.id);
              }}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Activate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game.id);
              }}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
