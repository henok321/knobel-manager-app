import { Badge, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Player, Table as TableType, Team } from '../../../../generated';

interface TeamHandoutCardProps {
  team: Team;
  players: Player[];
  tables: (TableType & { roundNumber?: number })[];
  gameName: string;
  numberOfRounds: number;
}

const TeamHandoutCard = ({
  team,
  players,
  tables,
  gameName,
  numberOfRounds,
}: TeamHandoutCardProps) => {
  const { t } = useTranslation();
  const rounds = Array.from({ length: numberOfRounds }, (_, i) => i + 1);

  const teamPlayerIds = new Set((team.players ?? []).map((p) => p.id));

  const teamPlayers = (team.players ?? [])
    .map((teamPlayer) => players.find((p) => p.id === teamPlayer.id))
    .filter((player): player is Player => player !== undefined);

  const playerAssignments: Record<
    number,
    Record<number, { tableNumber: number; roundNumber: number }>
  > = {};

  for (const table of tables) {
    if (!table.roundNumber) {
      continue;
    }

    for (const player of table.players || []) {
      if (teamPlayerIds.has(player.id)) {
        playerAssignments[player.id] ??= {};
        playerAssignments[player.id]![table.roundNumber!] = {
          tableNumber: table.tableNumber,
          roundNumber: table.roundNumber!,
        };
      }
    }
  }

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
              {rounds.map((r) => (
                <Table.Th key={r} style={{ textAlign: 'center' }}>
                  {t('pdf:teamHandout.round')} {r}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teamPlayers.map((player) => {
              const assignments = playerAssignments[player.id] || {};
              return (
                <Table.Tr key={player.id}>
                  <Table.Td fw={500}>{player.name}</Table.Td>
                  {rounds.map((roundNum) => {
                    const assignment = assignments[roundNum];
                    return (
                      <Table.Td key={roundNum} style={{ textAlign: 'center' }}>
                        {assignment ? (
                          <Badge color="blue" size="sm" variant="light">
                            {t('pdf:teamHandout.table')}{' '}
                            {assignment.tableNumber}
                          </Badge>
                        ) : (
                          <Text c="dimmed" fs="italic" size="sm">
                            {t('pdf:teamHandout.notAssigned')}
                          </Text>
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
