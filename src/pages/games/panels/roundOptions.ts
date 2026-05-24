import type { TFunction } from 'i18next';

export interface RoundOption {
  value: string;
  label: string;
}

export const buildRoundOptions = (
  t: TFunction,
  numberOfRounds: number,
  { includeTotal = false }: { includeTotal?: boolean } = {},
): RoundOption[] => {
  const rounds: RoundOption[] = Array.from(
    { length: numberOfRounds },
    (_, i) => ({
      value: String(i + 1),
      label: `${t('gameDetail:rounds.round')} ${i + 1}`,
    }),
  );

  if (includeTotal) {
    return [
      { value: 'total', label: t('gameDetail:rankings.totalRanking') },
      ...rounds,
    ];
  }
  return rounds;
};
