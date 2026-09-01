import { Badge, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Team } from '../../../store/api.gen.ts';
import { roundSequence } from '../../../utils/rounds.ts';
import type { RoundTableAssignment } from '../../../utils/tableAssignments.ts';

interface TeamHandoutCardProps {
  team: Team;
  playerTableAssignments: Record<number, RoundTableAssignment[]>;
  gameName: string;
  numberOfRounds: number;
}

const TeamHandoutCard = ({
  team,
  playerTableAssignments,
  gameName,
  numberOfRounds,
}: TeamHandoutCardProps) => {
  const { t } = useTranslation();
  const rounds = roundSequence(numberOfRounds);
  const teamPlayers = team.players ?? [];

  return (
    <Paper withBorder className="team-handout-card" p="md">
      <Stack gap="sm">
        <div>
          <Title order={3}>{team.name}</Title>
          <Text c="dimmed" size="sm">
            {gameName} &middot;{' '}
            {t('pdf:teamHandout.summary', {
              players: teamPlayers.length,
              rounds: numberOfRounds,
            })}
          </Text>
        </div>

        <Table
          striped
          withColumnBorders
          withTableBorder
          className="team-handout-table"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('pdf:teamHandout.player')}</Table.Th>
              {rounds.map((round) => (
                <Table.Th key={round} style={{ textAlign: 'center' }}>
                  {t('pdf:teamHandout.round')} {round}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teamPlayers.map((player) => {
              const tableByRound = new Map(
                (playerTableAssignments[player.id] ?? []).map((assignment) => [
                  assignment.roundNumber,
                  assignment.tableNumber,
                ]),
              );

              return (
                <Table.Tr key={player.id}>
                  <Table.Td fw={500}>{player.name}</Table.Td>
                  {rounds.map((round) => {
                    const tableNumber = tableByRound.get(round);

                    return (
                      <Table.Td key={round} style={{ textAlign: 'center' }}>
                        {tableNumber === undefined ? (
                          <Text c="dimmed" fs="italic" size="sm">
                            {t('pdf:teamHandout.notAssigned')}
                          </Text>
                        ) : (
                          <Badge color="blue" size="sm" variant="light">
                            {t('pdf:teamHandout.table')} {tableNumber}
                          </Badge>
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
};

export default TeamHandoutCard;
