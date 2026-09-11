import { Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Player } from '../../../../store/api.gen.ts';
import { roundSequence } from '../../../../utils/rounds.ts';
import type { RoundTableAssignment } from '../../../../utils/tableAssignments.ts';

interface TeamAssignmentMatrixProps {
  players: Player[];
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  numberOfRounds: number;
}

const PLAYER_COL_PERCENT = 40;

const TeamAssignmentMatrix = ({
  players,
  playerTableAssignments,
  numberOfRounds,
}: TeamAssignmentMatrixProps) => {
  const { t } = useTranslation();
  const rounds = roundSequence(numberOfRounds);
  const roundColWidth = `${(100 - PLAYER_COL_PERCENT) / numberOfRounds}%`;

  return (
    <Table
      captionSide="top"
      horizontalSpacing="xs"
      style={{ tableLayout: 'fixed', width: '100%' }}
      verticalSpacing="xs"
      withRowBorders={false}
    >
      <Table.Caption mt={0} ta="left">
        {t('gameDetail:teams.tablePerRound')}
      </Table.Caption>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={`${PLAYER_COL_PERCENT}%`}>
            {t('gameDetail:teams.players')}
          </Table.Th>
          {rounds.map((round) => (
            <Table.Th key={round} ta="center" w={roundColWidth}>
              {t('gameDetail:teams.roundColumn', { round })}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {players.map((player) => {
          const tableByRound = new Map(
            (playerTableAssignments[player.id] ?? []).map((assignment) => [
              assignment.roundNumber,
              assignment.tableNumber,
            ]),
          );

          return (
            <Table.Tr key={player.id}>
              <Table.Td>
                <Text size="sm" truncate>
                  {player.name}
                </Text>
              </Table.Td>
              {rounds.map((round) => {
                const tableNumber = tableByRound.get(round);

                return (
                  <Table.Td key={round} ta="center">
                    <Text
                      c={tableNumber === undefined ? 'dimmed' : undefined}
                      fw={600}
                      size="sm"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {tableNumber ?? '–'}
                    </Text>
                  </Table.Td>
                );
              })}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
};

export default TeamAssignmentMatrix;
