import type { TFunction } from 'i18next';
import type { GameRound, Table } from '../store/api.gen.ts';

export const roundSequence = (numberOfRounds: number): number[] =>
  Array.from({ length: numberOfRounds }, (_, i) => i + 1);

export const roundNumberById = (
  rounds: GameRound[] = [],
): Map<number, number> =>
  new Map(rounds.map((round) => [round.id, round.roundNumber]));

export const buildRoundOptions = (
  t: TFunction,
  numberOfRounds: number,
  { includeTotal = false }: { includeTotal?: boolean } = {},
) => {
  const rounds = roundSequence(numberOfRounds).map((round) => ({
    value: String(round),
    label: `${t('gameDetail:rounds.round')} ${round}`,
  }));

  return includeTotal
    ? [
        { value: 'total', label: t('gameDetail:rankings.totalRanking') },
        ...rounds,
      ]
    : rounds;
};

export type RoundTable = Table & { roundNumber?: number };
