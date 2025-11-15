import { Table as MantineTable } from '@mantine/core';

import { Player, Score } from '../../../api/types';
import { Team } from '../../../types';

interface PlayerScoreRowProps {
  player: Player;
  team: Team | undefined;
  score: Score | undefined;
}

export const PlayerScoreRow = ({
  player,
  team,
  score,
}: PlayerScoreRowProps) => (
  <MantineTable.Tr key={player.id}>
    <MantineTable.Td>{player.name}</MantineTable.Td>
    <MantineTable.Td>{team ? team.name : '-'}</MantineTable.Td>
    <MantineTable.Td>{score ? score.score : '-'}</MantineTable.Td>
  </MantineTable.Tr>
);
