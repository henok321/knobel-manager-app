import { Badge, Group, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Player } from '../../../../store/api.gen.ts';
import { roundSequence } from '../../../../utils/rounds.ts';
import type { RoundTableAssignment } from '../../../../utils/tableAssignments.ts';

interface TeamAssignmentMatrixProps {
  players: Player[];
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  numberOfRounds: number;
}

const PLAYER_COL_PERCENT = 32;

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
      horizontalSpacing="xs"
      style={{ tableLayout: 'fixed', width: '100%' }}
      verticalSpacing="xs"
      withRowBorders={false}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={`${PLAYER_COL_PERCENT}%`}>
            {t('gameDetail:teams.players')}
          </Table.Th>
          {rounds.map((round) => (
            <Table.Th key={round} ta="center" w={roundColWidth}>
              <Text component="span" fw={600} size="sm" visibleFrom="sm">
                {t('gameDetail:teams.roundColumn', { round })}
              </Text>
              <Text component="span" fw={600} hiddenFrom="sm" size="sm">
                {t('gameDetail:teams.roundColumnShort', { round })}
              </Text>
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {players.map((player) => {
          const assignmentByRound = new Map(
            (playerTableAssignments[player.id] ?? []).map((assignment) => [
              assignment.roundNumber,
              assignment,
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
                const assignment = assignmentByRound.get(round);
                return (
                  <Table.Td key={round}>
                    {assignment !== undefined && (
                      <Group gap="xs" justify="center" wrap="nowrap">
                        <Badge color="indigo" size="sm" variant="light">
                          <Text component="span" inherit visibleFrom="sm">
                            {t('gameDetail:teams.tableCell', {
                              table: assignment.tableNumber,
                            })}
                          </Text>
                          <Text component="span" hiddenFrom="sm" inherit>
                            {t('gameDetail:teams.tableCellShort', {
                              table: assignment.tableNumber,
                            })}
                          </Text>
                        </Badge>
                        {assignment.score && (
                          <Badge miw="3.5em" size="sm" variant="light">
                            <Text component="span" inherit visibleFrom="sm">
                              {t('gameDetail:teams.playerScore', {
                                score: assignment.score,
                              })}
                            </Text>
                            <Text component="span" hiddenFrom="sm" inherit>
                              {t('gameDetail:teams.playerScoreShort', {
                                score: assignment.score,
                              })}
                            </Text>
                          </Badge>
                        )}
                      </Group>
                    )}
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
