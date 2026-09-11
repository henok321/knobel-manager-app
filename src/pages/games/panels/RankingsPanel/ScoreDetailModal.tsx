import { Modal, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Player } from '../../../../store/api.gen.ts';
import { roundSequence } from '../../../../utils/rounds.ts';
import {
  type RoundTableAssignment,
  scoreTotal,
} from '../../../../utils/tableAssignments.ts';

interface ScoreDetailModalProps {
  title: string;
  players: Player[];
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  numberOfRounds: number;
  onClose: () => void;
}

const ScoreDetailModal = ({
  title,
  players,
  playerTableAssignments,
  numberOfRounds,
  onClose,
}: ScoreDetailModalProps) => {
  const { t } = useTranslation();
  const rounds = roundSequence(numberOfRounds);
  const showTeamTotal = players.length > 1;
  const teamTotal = players.reduce(
    (sum, player) => sum + scoreTotal(playerTableAssignments[player.id]),
    0,
  );

  return (
    <Modal centered opened size="lg" title={title} onClose={onClose}>
      <Stack gap="xs">
        <Text c="dimmed" size="sm">
          {t('gameDetail:rankings.scorePerRound')}
        </Text>

        <Table.ScrollContainer minWidth={480} type="native">
          <Table horizontalSpacing="xs" verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('common:rankings.player')}</Table.Th>
                {rounds.map((round) => (
                  <Table.Th key={round} ta="center">
                    {t('gameDetail:teams.roundColumn', { round })}
                  </Table.Th>
                ))}
                <Table.Th ta="right">
                  {t('gameDetail:rankings.totalRanking')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {players.map((player) => {
                const assignments = playerTableAssignments[player.id] ?? [];
                const assignmentByRound = new Map(
                  assignments.map((assignment) => [
                    assignment.roundNumber,
                    assignment,
                  ]),
                );

                return (
                  <Table.Tr key={player.id}>
                    <Table.Td>
                      <Text size="sm">{player.name}</Text>
                    </Table.Td>
                    {rounds.map((round) => {
                      const assignment = assignmentByRound.get(round);

                      return (
                        <Table.Td key={round} ta="center">
                          <Stack align="center" gap={0}>
                            <Text
                              c={
                                assignment?.score === undefined
                                  ? 'dimmed'
                                  : undefined
                              }
                              fw={600}
                              size="sm"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {assignment?.score ?? '–'}
                            </Text>
                            {assignment !== undefined && (
                              <Text c="dimmed" size="xs">
                                {t('gameDetail:teams.tableCellShort', {
                                  table: assignment.tableNumber,
                                })}
                              </Text>
                            )}
                          </Stack>
                        </Table.Td>
                      );
                    })}
                    <Table.Td ta="right">
                      <Text
                        fw={600}
                        size="sm"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {scoreTotal(assignments)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
            {showTeamTotal && (
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th colSpan={numberOfRounds + 1}>
                    {t('common:rankings.team')}
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text
                      fw={700}
                      size="sm"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {teamTotal}
                    </Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </Table.ScrollContainer>
      </Stack>
    </Modal>
  );
};

export default ScoreDetailModal;
